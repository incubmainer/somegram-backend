import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

import { LoggerService } from '@app/logger';
import { GithubProfile } from '../../../../common/guards/jwt/github.strategy';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { TokensPairType } from '../../domain/types';
import { SecurityDeviceCreateDto } from '../../../security-devices/domain/types';
import { AuthService } from '../auth.service';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';
import {
  UserCreatedByGithubDto,
  UserGitHubInfoCreatedDto,
} from '../../../users/domain/types';
import { Transactional } from '@nestjs-cls/transactional';
import { UserEntity } from '../../../users/domain/user.entity';

export class AuthWithGithubCommand {
  constructor(
    public user: GithubProfile,
    public ip: string,
    public userAgent: string,
  ) {}
}

@CommandHandler(AuthWithGithubCommand)
export class AuthWithGithubUseCase
  implements
    ICommandHandler<
      AuthWithGithubCommand,
      AppNotificationResultType<TokensPairType, string>
    >
{
  constructor(
    private userRepository: UsersRepository,
    private readonly logger: LoggerService,
    private readonly authService: AuthService,
    private readonly securityDevicesRepository: SecurityDevicesRepository,
    private readonly appNotification: ApplicationNotification,
    private readonly publisher: EventPublisher,
  ) {
    this.logger.setContext(AuthWithGithubUseCase.name);
  }
  async execute(
    command: AuthWithGithubCommand,
  ): Promise<AppNotificationResultType<TokensPairType, string>> {
    this.logger.debug('Execute: auth with github ', this.execute.name);
    const { githubId, username, displayName, email } = command.user;
    const { ip, userAgent } = command;
    try {
      if (!ip || !userAgent)
        return this.appNotification.badRequest('Bad input data');

      const [userGitHubInfo, userWithGithubInfo] = await Promise.all([
        this.userRepository.getUserByGithubId(githubId),
        this.userRepository.getUserByEmailWithGithubInfo(email),
      ]);

      if (userGitHubInfo) {
        if (userGitHubInfo.userBanInfo)
          return this.appNotification.unauthorized();

        const result = await this.createSession(
          userGitHubInfo.id,
          userAgent,
          ip,
        );
        return this.appNotification.success(result);
      }

      if (userWithGithubInfo?.user && userWithGithubInfo?.githubInfo)
        return this.appNotification.badRequest('User already exist');

      if (userWithGithubInfo?.user?.userBanInfo)
        return this.appNotification.unauthorized();

      const createdGithubInfoDto: UserGitHubInfoCreatedDto = {
        userId: userWithGithubInfo?.user.id ?? null,
        userName: username,
        githubId,
        email,
        displayName,
      };

      const result = await this.handleUser(
        createdGithubInfoDto,
        userWithGithubInfo?.user,
        ip,
        userAgent,
      );
      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
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

  @Transactional()
  private async handleUser(
    createdGithubInfoDto: UserGitHubInfoCreatedDto,
    user: UserEntity | null,
    ip: string,
    userAgent: string,
  ): Promise<TokensPairType> {
    let userId: string;
    let userForEvent: UserEntity;
    if (user) {
      await this.userRepository.addGithubInfoToUser(createdGithubInfoDto);

      if (!user.isConfirmed) await this.userRepository.confirmUser(user.id);

      userId = user.id;
      userForEvent = user;
    } else {
      const { email, displayName } = createdGithubInfoDto;
      const createdUserDto: UserCreatedByGithubDto = {
        createdAt: new Date(),
        email,
        isConfirmed: true,
        username: this.authService.generateUniqUserName(email),
        firstName: displayName,
      };

      const newUser =
        await this.userRepository.createUserByGithub(createdUserDto);

      createdGithubInfoDto.userId = newUser.id;
      userId = newUser.id;
      userForEvent = newUser;

      await this.userRepository.addGithubInfoToUser(createdGithubInfoDto);
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
}
