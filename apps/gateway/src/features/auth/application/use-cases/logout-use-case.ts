import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';

import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';
import { CheckRefreshTokenCommand } from './check-refresh-token';

export class LogoutCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(
    private securityDevicesRepository: SecurityDevicesRepository,
    private commandBus: CommandBus,
  ) {}
  async execute(command: LogoutCommand): Promise<boolean> {
    const deviceInfo = await this.commandBus.execute(
      new CheckRefreshTokenCommand(command.refreshToken),
    );

    const deletedToken = await this.securityDevicesRepository.deleteDevice(
      deviceInfo.deviceId,
    );
    if (!deletedToken) {
      throw new UnauthorizedException();
    }
    return deletedToken;
  }
}
