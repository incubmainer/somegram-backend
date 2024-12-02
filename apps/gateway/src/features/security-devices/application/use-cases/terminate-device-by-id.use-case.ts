import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';
import { SecurityDevices } from '@prisma/gateway';

export class TerminateDeviceByIdCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(TerminateDeviceByIdCommand)
export class TerminateDeviceByIdCommandHandler
  implements ICommandHandler<TerminateDeviceByIdCommand, void>
{
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async execute(command: TerminateDeviceByIdCommand): Promise<void> {
    const { userId, deviceId } = command;

    const device: SecurityDevices | null =
      await this.securityDevicesRepository.getDiviceById(deviceId);
    if (!device) return; // TODO Notification
    if (device.userId !== userId) return; // TODO Notification

    const result: boolean =
      await this.securityDevicesRepository.deleteDevice(deviceId);

    if (!result) return; // TODO Notification
    return;
  }
}
