import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';
import { SecurityDevices } from '@prisma/gateway';

export class TerminateDevicesExcludeCurrentCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(TerminateDevicesExcludeCurrentCommand)
export class TerminateDevicesExcludeCurrentCommandHandler
  implements ICommandHandler<TerminateDevicesExcludeCurrentCommand, void>
{
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async execute(command: TerminateDevicesExcludeCurrentCommand): Promise<void> {
    const { userId, deviceId } = command;

    const sessions: SecurityDevices[] | null =
      await this.securityDevicesRepository.getDevicesByUserId(userId);
    if (!sessions) return; // TODO Notification

    const ids: string[] = sessions
      .filter((session: SecurityDevices) => session.deviceId != deviceId)
      .map((session: SecurityDevices) => session.deviceId);
    if (ids.length <= 0) return; // TODO notification

    const result: boolean =
      await this.securityDevicesRepository.deleteSessionsById(ids);
    if (!result) return; // TODO Notification

    return;
  }
}
