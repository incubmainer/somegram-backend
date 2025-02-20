import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';
import { JWTRefreshTokenPayloadType } from '../../../../common/domain/types/types';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

export class LogoutCommand {
  constructor(public user: JWTRefreshTokenPayloadType) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(
    private securityDevicesRepository: SecurityDevicesRepository,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(LogoutUseCase.name);
  }
  async execute(
    command: LogoutCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug('Execute: logout command', this.execute.name);
    const { deviceId } = command.user;
    try {
      await this.securityDevicesRepository.deleteDevice(deviceId);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
