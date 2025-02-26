import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';
import { LoginDto } from '../../api/dto/input-dto/login-user-with-device.dto';
import { SecurityDeviceCreateDto } from '../../../security-devices/domain/types';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';
import { TokensPairType } from '../../domain/types';

export class LoginUserCommand {
  constructor(
    public loginDto: LoginDto,
    public userAgent: string,
    public ip: string,
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase
  implements
    ICommandHandler<
      LoginUserCommand,
      AppNotificationResultType<TokensPairType, null>
    >
{
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UsersRepository,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {
    this.logger.setContext(LoginUserUseCase.name);
  }
  async execute(
    command: LoginUserCommand,
  ): Promise<AppNotificationResultType<TokensPairType, null>> {
    this.logger.debug('Execute: login command', this.execute.name);
    const { password, email } = command.loginDto;
    const { ip, userAgent } = command;
    try {
      const user = await this.userRepository.getUserByEmail(email);

      if (!user) return this.appNotification.unauthorized();
      if (!user.isConfirmed) return this.appNotification.unauthorized();
      if (!user.hashPassword) return this.appNotification.unauthorized();

      const verifyPassword = await this.authService.comparePass(
        password,
        user.hashPassword,
      );
      if (!verifyPassword) return this.appNotification.unauthorized();

      const userId = user.id;
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

      return this.appNotification.success({ accessToken, refreshToken });
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
