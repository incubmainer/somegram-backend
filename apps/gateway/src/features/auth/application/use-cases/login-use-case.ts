import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';
import { randomUUID } from 'crypto';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';
import { LoginDto } from '../../api/dto/input-dto/login-user-with-device.dto';

export const LoginCodes = {
  Success: Symbol('success'),
  UserDoesntExist: Symbol('user_doesnt_exist'),
  WrongPassword: Symbol('wrong_password'),
  EmailAlreadyExists: Symbol('email_already_exists'),
  TransactionError: Symbol('transaction_error'),
};

export class LoginUserCommand {
  constructor(
    public loginDto: LoginDto,
    public ip: string,
    public title: string,
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    private readonly authService: AuthService,
    private readonly securityDevicesRepo: SecurityDevicesRepository,
  ) {}
  async execute(
    command: LoginUserCommand,
  ): Promise<{ refreshToken: string; accessToken: string } | null> {
    const { loginDto, ip, title } = command;
    const userId = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!userId) {
      return null;
    }
    const deviceId = randomUUID();
    const refreshToken = await this.authService.createRefreshToken(
      userId,
      deviceId,
    );
    const payload = await this.authService.verifyRefreshToken(refreshToken);
    const accessToken = await this.authService.createAccesshToken(userId);
    const lastActiveDate = new Date(payload.iat * 1000).toISOString();

    await this.securityDevicesRepo.addDevice(
      userId,
      deviceId,
      ip,
      lastActiveDate,
      title,
    );
    return { refreshToken, accessToken };
  }
}
