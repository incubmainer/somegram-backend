import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DeviceDto,
  LoginUserWithDeviceDto,
} from '../../api/dto/input-dto/login-user-with-device.dto';
import { AuthService } from '../auth.service';
import { randomUUID } from 'crypto';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';

export class LoginUserCommand {
  constructor(public loginUserWithDeviceDto: LoginUserWithDeviceDto) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    private authService: AuthService,
    private readonly SecurityDevicesRepo: SecurityDevicesRepository,
  ) {}
  async execute(command: LoginUserCommand): Promise<any> {
    const { loginUserWithDeviceDto } = command;
    const deviceId = randomUUID();
    const refreshToken = await this.authService.createRefreshToken(
      loginUserWithDeviceDto.user,
      deviceId,
    );
    const accessToken = await this.authService.login(
      loginUserWithDeviceDto.user,
    );
    const result = await this.authService.verifyRefreshToken(refreshToken);
    const lastActiveDate = new Date(result.iat * 1000).toISOString();
    const deviceDto = new DeviceDto();
    deviceDto.deviceId = deviceId;
    deviceDto.ip = loginUserWithDeviceDto.ip;
    deviceDto.lastActiveDate = lastActiveDate;
    deviceDto.title = loginUserWithDeviceDto.title;
    deviceDto.userId = loginUserWithDeviceDto.user.id;
    await this.SecurityDevicesRepo.addDevice(deviceDto);
    const accesAndRefreshTokens = { refreshToken, accessToken };
    return accesAndRefreshTokens;
  }
}
