import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';
import { SecurityDevices } from '@prisma/gateway';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';

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
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(TerminateDevicesExcludeCurrentCommandHandler.name);
  }

  async execute(
    command: TerminateDevicesExcludeCurrentCommand,
  ): Promise<AppNotificationResultType<void>> {
    this.logger.debug(
      'Execute: delete all device exclude current',
      this.execute.name,
    );
    const { userId, deviceId } = command;
    try {
      const sessions: SecurityDevices[] | null =
        await this.securityDevicesRepository.getDevicesByUserId(userId);
      if (!sessions) return this.applicationNotification.notFound();

      const ids: string[] = sessions
        .filter((session: SecurityDevices) => session.deviceId != deviceId)
        .map((session: SecurityDevices) => session.deviceId);
      if (ids.length <= 0) return this.applicationNotification.notFound();

      await this.securityDevicesRepository.deleteSessionsById(ids);

      return this.applicationNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.applicationNotification.internalServerError();
    }
  }
}
