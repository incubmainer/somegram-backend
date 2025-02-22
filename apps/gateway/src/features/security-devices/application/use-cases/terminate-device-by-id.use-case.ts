import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';

export class TerminateDeviceByIdCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(TerminateDeviceByIdCommand)
export class TerminateDeviceByIdCommandHandler
  implements
    ICommandHandler<
      TerminateDeviceByIdCommand,
      AppNotificationResultType<void>
    >
{
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesRepository,
    private readonly applicationNotification: ApplicationNotification,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(TerminateDeviceByIdCommandHandler.name);
  }

  async execute(
    command: TerminateDeviceByIdCommand,
  ): Promise<AppNotificationResultType<void>> {
    this.logger.debug(
      'Execute: delete device by id command',
      this.execute.name,
    );
    const { userId, deviceId } = command;
    try {
      const device =
        await this.securityDevicesRepository.getDeviceById(deviceId);

      if (!device) return this.applicationNotification.notFound();
      if (device.userId !== userId)
        return this.applicationNotification.forbidden();

      await this.securityDevicesRepository.deleteDevice(deviceId);

      return this.applicationNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.applicationNotification.internalServerError();
    }
  }
}
