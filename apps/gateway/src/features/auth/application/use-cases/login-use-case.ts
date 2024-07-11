import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginUserWithDeviceDto } from '../../api/dto/input-dto/login-user-with-device.dto';
import { AuthService } from '../auth.service';
import { randomUUID } from 'crypto';

export class LoginUserCommand {
  constructor(public loginUserWithDeviceDto: LoginUserWithDeviceDto) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(private authService: AuthService) {}
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
    const accesAndRefreshTokens = { refreshToken, accessToken };
    return accesAndRefreshTokens;
  }
}
