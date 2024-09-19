import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';
import { UserRepository } from '../../infrastructure/user.repository';
import { UnauthorizedException } from '@nestjs/common';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';
import { CreateTokensCommand } from './create-token.use-case';

export class RefreshTokenCommand {
  constructor(public refreshToken: string) {}
}
@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    private authServise: AuthService,
    private securityDevicesRepository: SecurityDevicesRepository,
    private usersRepository: UserRepository,
    private readonly commandBus: CommandBus,
  ) {}
  async execute(command: RefreshTokenCommand): Promise<object> {
    const payload = await this.authServise.verifyRefreshToken(
      command.refreshToken,
    );
    if (!payload) {
      throw new UnauthorizedException();
    }
    const user = await this.usersRepository.findUserById(payload.userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    const deviceId = payload.deviceId;
    const isOkLastactiveDate = new Date(payload.iat * 1000).toISOString();
    const isValidRefreshToken =
      await this.securityDevicesRepository.isValidRefreshTokenWithDeviceId(
        isOkLastactiveDate,
        deviceId,
      );

    if (!isValidRefreshToken) {
      throw new UnauthorizedException();
    }
    const tokens = await this.commandBus.execute(
      new CreateTokensCommand(user.id, deviceId),
    );
    const result = await this.authServise.verifyRefreshToken(
      tokens.refreshToken,
    );
    const lastActiveDate = new Date(result.iat * 1000).toISOString();
    await this.securityDevicesRepository.updateLastActiveDate(
      deviceId,
      lastActiveDate,
    );
    return {
      refreshToken: tokens.refreshToken,
      accessToken: tokens.accessToken,
    };
  }
}
