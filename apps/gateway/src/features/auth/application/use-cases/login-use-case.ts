import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';
import { randomUUID } from 'crypto';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';
import { User } from '@prisma/gateway';

export const LoginCodes = {
  Success: Symbol('success'),
  UserDoesntExist: Symbol('user_doesnt_exist'),
  WrongPassword: Symbol('wrong_password'),
  EmailAlreadyExists: Symbol('email_already_exists'),
  TransactionError: Symbol('transaction_error'),
};

export class LoginUserCommand {
  constructor(
    public user: User,
    public ip: string,
    public title: string,
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    private authService: AuthService,
    private readonly SecurityDevicesRepo: SecurityDevicesRepository,
  ) {}
  async execute(command: LoginUserCommand): Promise<any> {
    const { user, ip, title } = command;
    const deviceId = randomUUID();
    const refreshToken = await this.authService.createRefreshToken(
      user,
      deviceId,
    );
    const accessToken = await this.authService.login(user);
    const lastActiveDate = new Date().toISOString();
    await this.SecurityDevicesRepo.addDevice(
      user.id,
      deviceId,
      ip,
      lastActiveDate,
      title,
    );
    const accesAndRefreshTokens = { refreshToken, accessToken };
    return accesAndRefreshTokens;
  }
}
