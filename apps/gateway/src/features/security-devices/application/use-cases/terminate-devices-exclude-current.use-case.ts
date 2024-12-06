import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';
import { SecurityDevices } from '@prisma/gateway';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

export class TerminateDevicesExcludeCurrentCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(TerminateDevicesExcludeCurrentCommand)
export class TerminateDevicesExcludeCurrentCommandHandler
  implements
    ICommandHandler<
      TerminateDevicesExcludeCurrentCommand,
      AppNotificationResultType<void>
    >
{
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesRepository,
    private readonly applicationNotification: ApplicationNotification,
  ) {}

  async execute(
    command: TerminateDevicesExcludeCurrentCommand,
  ): Promise<AppNotificationResultType<void>> {
    const { userId, deviceId } = command;

    const sessions: SecurityDevices[] | null =
      await this.securityDevicesRepository.getDevicesByUserId(userId);
    if (!sessions) return this.applicationNotification.notFound();

    const ids: string[] = sessions
      .filter((session: SecurityDevices) => session.deviceId != deviceId)
      .map((session: SecurityDevices) => session.deviceId);
    if (ids.length <= 0) return this.applicationNotification.notFound();

    const result: boolean =
      await this.securityDevicesRepository.deleteSessionsById(ids);
    if (!result) return this.applicationNotification.internalServerError();

    return this.applicationNotification.success(null);
  }
}
