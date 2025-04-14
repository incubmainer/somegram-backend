import { Transactional } from '@nestjs-cls/transactional';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { GoogleProfile } from '../../../../common/guards/jwt/google.strategy';
import {
  UserCreatedByGoogleDto,
  UserGoogleInfoCreatedDto,
} from '../../../users/domain/types';
import { UserEntity } from '../../../users/domain/user.entity';
import { AuthService } from '../auth.service';
import { SecurityDeviceCreateDto } from '../../../security-devices/domain/types';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';
import { TokensPairType } from '../../domain/types';

export class LoginByGoogleCommand {
  constructor(
    public googleProfile: GoogleProfile,
    public ip: string,
    public userAgent: string,
  ) {}
}

@CommandHandler(LoginByGoogleCommand)
export class LoginByGoogleUseCase
  implements
    ICommandHandler<
      LoginByGoogleCommand,
      AppNotificationResultType<TokensPairType, string>
    >
{
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
    private readonly authService: AuthService,
    private readonly securityDevicesRepository: SecurityDevicesRepository,
    private readonly publisher: EventPublisher,
  ) {
    this.logger.setContext(LoginByGoogleUseCase.name);
  }

  public async execute(
    command: LoginByGoogleCommand,
  ): Promise<AppNotificationResultType<TokensPairType, string>> {
    const { googleId, googleEmail, googleEmailVerified } =
      command.googleProfile;

    const { ip, userAgent } = command;

    try {
      if (!ip || !userAgent)
        return this.appNotification.badRequest('Bad input data');

      if (!googleEmailVerified)
        return this.appNotification.badRequest('Google email not verified');

      const [userGoogleInfo, userWithGoogleInfo] = await Promise.all([
        this.userRepository.getUserByGoogleSub(googleId),
        this.userRepository.getUserByEmailWithGoogleInfo(googleEmail),
      ]);

      if (userGoogleInfo) {
        if (userGoogleInfo.userBanInfo)
          return this.appNotification.unauthorized();

        const result = await this.createSession(
          userGoogleInfo.id,
          userAgent,
          ip,
        );
        return this.appNotification.success(result);
      }

      if (userWithGoogleInfo?.user && userWithGoogleInfo?.googleInfo)
        return this.appNotification.badRequest('User already exist');

      if (userWithGoogleInfo?.user?.userBanInfo)
        return this.appNotification.unauthorized();

      const createdGoogleInfoDto: UserGoogleInfoCreatedDto = {
        userId: userWithGoogleInfo?.user.id ?? null,
        subGoogleId: googleId,
        googleEmail: googleEmail,
        googleEmailVerified: googleEmailVerified,
      };

      const result = await this.handleUser(
        createdGoogleInfoDto,
        userWithGoogleInfo?.user,
        ip,
        userAgent,
      );
      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  @Transactional()
  private async handleUser(
    createdGoogleInfoDto: UserGoogleInfoCreatedDto,
    user: UserEntity | null,
    ip: string,
    userAgent: string,
  ): Promise<TokensPairType> {
    let userId: string;
    let userForEvent: UserEntity;
    if (user) {
      await this.userRepository.addGoogleInfoToUser(createdGoogleInfoDto);

      if (!user.isConfirmed) await this.userRepository.confirmUser(user.id);

      userId = user.id;
      userForEvent = user;
    } else {
      const { googleEmail } = createdGoogleInfoDto;
      const createdUserDto: UserCreatedByGoogleDto = {
        createdAt: new Date(),
        email: googleEmail,
        isConfirmed: true,
        username: this.authService.generateUniqUserName(googleEmail),
      };

      const newUser =
        await this.userRepository.createUserByGoogle(createdUserDto);

      createdGoogleInfoDto.userId = newUser.id;
      userId = newUser.id;
      userForEvent = newUser;

      await this.userRepository.addGoogleInfoToUser(createdGoogleInfoDto);
    }

    const tokens = await this.createSession(userId, userAgent, ip);
    this.publishEvent(userForEvent);
    return tokens;
  }

  private publishEvent(user: UserEntity): void {
    const userWithEvents = this.publisher.mergeObjectContext(user);

    userWithEvents.registrationSuccessEvent();
    userWithEvents.commit();
  }

  private async createSession(
    userId: string,
    userAgent: string,
    ip: string,
  ): Promise<TokensPairType> {
    const deviceId = this.authService.generateDeviceId(userId);
    const accessToken = await this.authService.generateAccessToken(userId);
    const refreshToken = await this.authService.generateRefreshToken(
      userId,
      deviceId,
    );

    const { iat } = await this.authService.verifyRefreshToken(refreshToken);

    const sessionCreatedDto: SecurityDeviceCreateDto = {
      iat: new Date(iat * 1000),
      deviceId: deviceId,
      userId: userId,
      userAgent: userAgent,
      ip: ip,
    };

    await this.securityDevicesRepository.createSession(sessionCreatedDto);
    return { accessToken, refreshToken };
  }
}
