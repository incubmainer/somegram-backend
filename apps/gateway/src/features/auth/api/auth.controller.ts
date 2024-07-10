import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  RegistrationCodes,
  RegistrationCommand,
} from '../application/use-cases/registration.use-case';
import { Notification } from 'apps/gateway/src/common/domain/notification';
import { RegistrationBodyInputDto } from './dto/input-dto/registration.body.input-dto';
import { ApiTags } from '@nestjs/swagger';
import { RegistrationSwagger } from './swagger/registration.swagger';
import { RegistrationConfirmationBodyInputDto } from './dto/input-dto/registration-confirmation.body.input-dto';
import {
  RegistrationConfirmationCodes,
  RegistrationConfirmationCommand,
} from '../application/use-cases/registration-confirmation.use-case';
import { RegistrationConfirmationSwagger } from './swagger/registration-confirmation.swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) { }

  @Post('registration')
  @HttpCode(HttpStatus.OK)
  @RegistrationSwagger()
  public async registration(@Body() body: RegistrationBodyInputDto) {
    const notification: Notification<null> = await this.commandBus.execute(
      new RegistrationCommand(body.username, body.email, body.password),
    );
    const code = notification.getCode();
    if (code === RegistrationCodes.Success)
      return {
        statusCode: HttpStatus.OK,
        message: 'Registration successful',
      };
    if (code === RegistrationCodes.EmailAlreadyExists)
      throw new BadRequestException({
        error: 'registration_failed',
        message:
          'Registration failed due to conflict with existing email or username.',
        details: {
          email: 'Email address is already in use.',
        },
      });
    if (code === RegistrationCodes.UsernameAlreadyExists)
      throw new BadRequestException({
        error: 'registration_failed',
        message:
          'Registration failed due to conflict with existing email or username.',
        details: {
          username: 'Username is already taken.',
        },
      });
    if (code === RegistrationCodes.TransactionError)
      throw new InternalServerErrorException({
        message: 'Transaction error',
      });
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.OK)
  @RegistrationConfirmationSwagger()
  public async registrationConfirmation(
    @Body() body: RegistrationConfirmationBodyInputDto,
  ) {
    const notification: Notification<null> = await this.commandBus.execute(
      new RegistrationConfirmationCommand(body.token),
    );
    const code = notification.getCode();
    if (code === RegistrationConfirmationCodes.Success)
      return {
        statusCode: HttpStatus.OK,
        message: 'Registration confirmation successful',
      };
    if (code === RegistrationConfirmationCodes.TokenExpired)
      throw new BadRequestException({
        error: 'registration_confirmation_failed',
        message: 'Registration confirmation failed due to token expiration.',
      });
    if (code === RegistrationConfirmationCodes.TokenInvalid)
      throw new BadRequestException({
        error: 'registration_confirmation_failed',
        message: 'Registration confirmation failed due to invalid token.',
      });
    if (code === RegistrationConfirmationCodes.TransactionError)
      throw new InternalServerErrorException({
        message: 'Transaction error',
      });
  }
}
