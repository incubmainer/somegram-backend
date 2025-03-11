import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { AuthService } from '../auth.service';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { JWTRefreshTokenPayloadType, TokensPairType } from '../../domain/types';

export class RenewTokensCommand {
  constructor(public user: JWTRefreshTokenPayloadType) {}
}
@CommandHandler(RenewTokensCommand)
export class RenewTokensUseCase
  implements
    ICommandHandler<
      RenewTokensCommand,
      AppNotificationResultType<TokensPairType, null>
    >
{
  constructor(
    private authService: AuthService,
    private securityDevicesRepository: SecurityDevicesRepository,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(RenewTokensUseCase.name);
  }
  async execute(
    command: RenewTokensCommand,
  ): Promise<AppNotificationResultType<TokensPairType, null>> {
    this.logger.debug('Execute: renew tokens', this.execute.name);
    const { deviceId, userId } = command.user;
    try {
      const session =
        await this.securityDevicesRepository.getDeviceById(deviceId);
      if (!session) return this.appNotification.unauthorized();

      const accessToken = await this.authService.generateAccessToken(userId);
      const refreshToken = await this.authService.generateRefreshToken(
        userId,
        deviceId,
      );
      const { iat } = await this.authService.verifyRefreshToken(refreshToken);

      session.renewSession(new Date(iat * 1000));

      await this.securityDevicesRepository.updateLastActiveDate(session);
      return this.appNotification.success({ accessToken, refreshToken });
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
