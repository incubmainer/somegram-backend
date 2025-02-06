import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';
import { SecurityDevices } from '@prisma/gateway';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

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
  ) {}

  async execute(
    command: TerminateDeviceByIdCommand,
  ): Promise<AppNotificationResultType<void>> {
    const { userId, deviceId } = command;
    try {
      const device: SecurityDevices | null =
        await this.securityDevicesRepository.getDeviceById(deviceId);

      if (!device) return this.applicationNotification.notFound();
      if (device.userId !== userId)
        return this.applicationNotification.forbidden();

      await this.securityDevicesRepository.deleteDevice(deviceId);

      return this.applicationNotification.success(null);
    } catch (e) {
      return this.applicationNotification.internalServerError();
    }
  }
}
