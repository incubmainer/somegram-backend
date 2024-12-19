import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';

export class CheckRefreshTokenCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(CheckRefreshTokenCommand)
export class CheckRefreshTokenUseCase
  implements ICommandHandler<CheckRefreshTokenCommand>
{
  constructor(
    private authService: AuthService,
    private securityDevicesRepository: SecurityDevicesRepository,
    private userRepository: UsersRepository,
  ) {}
  async execute(command: CheckRefreshTokenCommand) {
    const payload = await this.authService.verifyRefreshToken(
      command.refreshToken,
    );
    if (!payload) {
      throw new UnauthorizedException();
    }

    const user = await this.userRepository.getUserById(payload.userId);
    const device = await this.securityDevicesRepository.getDiviceById(
      payload.deviceId,
    );

    if (
      !user ||
      !device ||
      new Date(payload!.iat! * 1000).toISOString() !== device.lastActiveDate
    ) {
      throw new UnauthorizedException();
    }

    const userDeviceInfo = {
      userId: payload.userId,
      deviceId: payload.deviceId,
      iat: payload.iat,
      exp: payload.exp,
    };
    return userDeviceInfo;
  }
}
