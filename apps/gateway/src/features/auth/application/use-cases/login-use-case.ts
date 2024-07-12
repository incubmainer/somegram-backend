import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';
import { randomUUID } from 'crypto';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';

export const LoginCodes = {
  Success: Symbol('success'),
  UserDoesntExist: Symbol('user_doesnt_exist'),
  WrongPassword: Symbol('wrong_password'),
  EmailAlreadyExists: Symbol('email_already_exists'),
  TransactionError: Symbol('transaction_error'),
};

export class LoginUserCommand {
  constructor(
    public userId: string,
    public ip: string,
    public title: string,
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    private readonly authService: AuthService,
    private readonly SecurityDevicesRepo: SecurityDevicesRepository,
  ) {}
  async execute(
    command: LoginUserCommand,
  ): Promise<{ refreshToken: string; accessToken: string }> {
    const { userId, ip, title } = command;
    const deviceId = randomUUID();
    const refreshToken = await this.authService.createRefreshToken(
      userId,
      deviceId,
    );
    const accessToken = await this.authService.login(userId);
    const lastActiveDate = new Date().toISOString();
    await this.SecurityDevicesRepo.addDevice(
      userId,
      deviceId,
      ip,
      lastActiveDate,
      title,
    );
    return { refreshToken: refreshToken, accessToken: accessToken.accessToken };
  }
}
