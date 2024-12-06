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

    const device: SecurityDevices | null =
      await this.securityDevicesRepository.getDiviceById(deviceId);

    if (!device) return this.applicationNotification.notFound();
    if (device.userId !== userId)
      return this.applicationNotification.forbidden();

    const result: boolean =
      await this.securityDevicesRepository.deleteDevice(deviceId);

    if (!result) return this.applicationNotification.internalServerError();
    return this.applicationNotification.success(null);
  }
}
