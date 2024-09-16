import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';
import { randomUUID } from 'crypto';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';
import { LoginDto } from '../../api/dto/input-dto/login-user-with-device.dto';
import { CreateTokensCommand } from './create-token.use-case';

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
    private readonly commandBus: CommandBus,
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
    const tokens = await this.commandBus.execute(
      new CreateTokensCommand(userId, deviceId),
    );

    const payload = await this.authService.verifyRefreshToken(
      tokens.refreshToken,
    );
    const lastActiveDate = new Date(payload.iat * 1000).toISOString();

    await this.securityDevicesRepo.addDevice(
      userId,
      deviceId,
      ip,
      lastActiveDate,
      title,
    );

    return {
      refreshToken: tokens.refreshToken,
      accessToken: tokens.accessToken,
    };
  }
}
