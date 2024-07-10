import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginUserWithDeviceDto } from '../../api/dto/input-dto/login-user-with-device.dto';
import { AuthService } from '../auth.service';

export class LoginUserCommand {
  constructor(public loginUserWithDeviceDto: LoginUserWithDeviceDto) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(private authService: AuthService) {}
  async execute(command: LoginUserCommand): Promise<any> {}
}
