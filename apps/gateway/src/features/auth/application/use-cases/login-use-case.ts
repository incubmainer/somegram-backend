import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';

import { LoginDto } from '../../api/dto/input-dto/login-user-with-device.dto';
import { CreateTokensCommand } from './create-token.use-case';
import { AddUserDeviceCommand } from './add-user-device.use-case';
import { UnauthorizedException } from '@nestjs/common';

export class LoginUserCommand {
  constructor(
    public loginDto: LoginDto,
    public userAgent: string,
    public ip: string,
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    private readonly authService: AuthService,
    private readonly commandBus: CommandBus,
  ) {}
  async execute(
    command: LoginUserCommand,
  ): Promise<{ refreshToken: string; accessToken: string } | null> {
    const { loginDto, ip, userAgent } = command;
    const userId = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!userId) {
      throw new UnauthorizedException();
    }
    const tokens = await this.commandBus.execute(
      new CreateTokensCommand(userId),
    );

    await this.commandBus.execute(
      new AddUserDeviceCommand(tokens.refreshToken, userAgent, ip),
    );

    return tokens;
  }
}
