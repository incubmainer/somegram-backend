import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { AuthService } from '../auth.service';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';

export class AddUserDeviceCommand {
  constructor(
    public refreshToken: string,
    public deviceTitle: string,
    public ipAddress: string,
  ) {}
}

@CommandHandler(AddUserDeviceCommand)
export class AddUserDeviceUseCase
  implements ICommandHandler<AddUserDeviceCommand>
{
  constructor(
    private readonly authService: AuthService,
    private readonly securityDevicesRepo: SecurityDevicesRepository,
  ) {}

  async execute(command: AddUserDeviceCommand) {
    const payload = await this.authService.verifyRefreshToken(
      command.refreshToken,
    );
    const lastActiveDate = new Date(payload.iat * 1000).toISOString();

    await this.securityDevicesRepo.addDevice(
      payload.userId,
      payload.deviceId,
      command.ipAddress,
      lastActiveDate,
      command.deviceTitle,
    );
  }
}
