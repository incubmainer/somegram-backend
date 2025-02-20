import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';
import { LoggerService } from '@app/logger';
import { JWTRefreshTokenPayloadType } from '../../../../common/domain/types/types';
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
  async execute(
    command: CheckRefreshTokenCommand,
  ): Promise<JWTRefreshTokenPayloadType | null> {
    this.logger.debug('Execute: check refresh token', this.execute.name);
    try {
      const payload = await this.authService.verifyRefreshToken(
        command.refreshToken,
      );
      if (!payload) {
        return null;
      }
      // @ts-ignore TODO:
      const user = await this.userRepository.getUserById(payload.userId);
      const device = await this.securityDevicesRepository.getDeviceById(
        payload.deviceId,
      );

      if (
        !user ||
        !device ||
        // @ts-ignore // TODO:
        new Date(payload!.iat! * 1000).toISOString() !== device.lastActiveDate
      ) {
        return null;
      }

      return payload;
    } catch (e) {
      this.logger.error(e, this.execute.name);
    }
  }
}
