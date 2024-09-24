import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { AuthService } from '../auth.service';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';
import { CreateTokensCommand } from './create-token.use-case';
import { CheckRefreshTokenCommand } from './check-refresh-token';

export class RenewTokensCommand {
  constructor(public refreshToken: string) {}
}
@CommandHandler(RenewTokensCommand)
export class RenewTokensUseCase implements ICommandHandler<RenewTokensCommand> {
  constructor(
    private authService: AuthService,
    private securityDevicesRepository: SecurityDevicesRepository,
    private readonly commandBus: CommandBus,
  ) {}
  async execute(command: RenewTokensCommand): Promise<object> {
    const deviceInfo = await this.commandBus.execute(
      new CheckRefreshTokenCommand(command.refreshToken),
    );
    const tokens = await this.commandBus.execute(
      new CreateTokensCommand(deviceInfo.userId, deviceInfo.deviceId),
    );
    const result = await this.authService.verifyRefreshToken(
      tokens.refreshToken,
    );
    const lastActiveDate = new Date(result.iat * 1000).toISOString();
    await this.securityDevicesRepository.updateLastActiveDate(
      deviceInfo.deviceId,
      lastActiveDate,
    );
    return tokens;
  }
}
