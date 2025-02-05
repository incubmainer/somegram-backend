import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';
import { LoggerService } from '@app/logger';

export class CheckRefreshTokenCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(CheckRefreshTokenCommand)
export class CheckRefreshTokenUseCase
  implements ICommandHandler<CheckRefreshTokenCommand>
{
  constructor(
    private authService: AuthService,
    private securityDevicesRepository: SecurityDevicesRepository,
    private userRepository: UsersRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(CheckRefreshTokenUseCase.name);
  }
  async execute(command: CheckRefreshTokenCommand) {
    this.logger.debug('Execute: check refresh token', this.execute.name);
    try {
      const payload = await this.authService.verifyRefreshToken(
        command.refreshToken,
      );
      if (!payload) {
        throw new UnauthorizedException();
      }

      const user = await this.userRepository.getUserById(payload.userId);
      const device = await this.securityDevicesRepository.getDeviceById(
        payload.deviceId,
      );

      if (
        !user ||
        !device ||
        new Date(payload!.iat! * 1000).toISOString() !== device.lastActiveDate
      ) {
        throw new UnauthorizedException();
      }

      const userDeviceInfo = {
        userId: payload.userId,
        deviceId: payload.deviceId,
        iat: payload.iat,
        exp: payload.exp,
      };
      return userDeviceInfo;
    } catch (e) {
      this.logger.error(e, this.execute.name);
    }
  }
}
