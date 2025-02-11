import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';
import { CheckRefreshTokenCommand } from './check-refresh-token';
import { JWTRefreshTokenPayloadType } from '../../../../common/domain/types/types';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
export class LogoutCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(
    private securityDevicesRepository: SecurityDevicesRepository,
    private commandBus: CommandBus,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(LogoutUseCase.name);
  }
  async execute(
    command: LogoutCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug('Execute: logout', this.execute.name);
    try {
      const refreshTokenPayload: JWTRefreshTokenPayloadType | null =
        await this.commandBus.execute(
          new CheckRefreshTokenCommand(command.refreshToken),
        );
      if (!refreshTokenPayload) return this.appNotification.unauthorized();

      await this.securityDevicesRepository.deleteDevice(
        refreshTokenPayload.deviceId,
      );

      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
    }
  }
}
