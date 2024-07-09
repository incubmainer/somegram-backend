import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegisterCommand } from '../application/register/command';
import { Username } from '../domain/value-objects/username';
import { Email } from '../domain/value-objects/email';
import { Password } from '../domain/value-objects/password';
import { CommandBus } from '@nestjs/cqrs';

@Controller('auth')
export class AuthController {
  constructor(private commandBus: CommandBus) { }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: any) {
    const command = new RegisterCommand(
      new Username(body.username),
      new Email(body.email),
      new Password(body.password),
    );
    const notification = await this.commandBus.execute(command);
    console.log(notification.getCode());
  }
}
