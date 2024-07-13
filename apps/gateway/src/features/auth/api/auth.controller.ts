import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Res,
  Request,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  RegistrationCodes,
  RegistrationCommand,
} from '../application/use-cases/registration.use-case';
import { Notification } from 'apps/gateway/src/common/domain/notification';
import { RegistrationBodyInputDto } from './dto/input-dto/registration.body.input-dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { RegistrationSwagger } from './swagger/registration.swagger';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { Response } from 'express';
import { LoginDto } from './dto/input-dto/login-user-with-device.dto';
import { LoginUserCommand } from '../application/use-cases/login-use-case';
import { LoginSwagger } from './swagger/login.swagger';
import { RegistrationConfirmationBodyInputDto } from './dto/input-dto/registration-confirmation.body.input-dto';
import {
  RegistrationConfirmationCodes,
  RegistrationConfirmationCommand,
} from '../application/use-cases/registration-confirmation.use-case';
import { RegistrationConfirmationSwagger } from './swagger/registration-confirmation.swagger';
import { RestorePasswordBodyInputDto } from './dto/input-dto/restore-password.body.input-dto';
import {
  RestorePasswordCodes,
  RestorePasswordCommand,
} from '../application/use-cases/restore-password.use-case';
import { RestorePasswordSwagger } from './swagger/restore-password.swagger';
import {
  RestorePasswordConfirmationCodes,
  RestorePasswordConfirmationCommand,
} from '../application/use-cases/restore-password-confirmation.use-case';
import { RestorePasswordConfirmationBodyInputDto } from './dto/input-dto/restore-password-confirmation.body.input-dto';
import { RestorePasswordConfirmationSwagger } from './swagger/restore-password-confirmation.swagger';
import { CurrentUserId } from './decorators/current-user-id-param.decorator';
import { IpAddress } from './decorators/ip-address.decorator';
import { UserAgent } from './decorators/user-agent.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

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

  @Post('restore-password')
  @HttpCode(HttpStatus.OK)
  @RestorePasswordSwagger()
  public async restorePassword(@Body() body: RestorePasswordBodyInputDto) {
    const notification: Notification<null> = await this.commandBus.execute(
      new RestorePasswordCommand(body.email, body.recaptchaToken),
    );
    const code = notification.getCode();
    if (code === RestorePasswordCodes.Success)
      return {
        statusCode: HttpStatus.OK,
        message: 'Restore password successful',
      };
    if (code === RestorePasswordCodes.UnvalidRecaptcha)
      throw new BadRequestException({
        error: 'invalid_recaptcha_token',
        message: 'Restore password failed due to invalid recaptcha token.',
      });
    if (code === RestorePasswordCodes.UserNotFound)
      throw new BadRequestException({
        error: 'user_not_found',
        message: 'Restore password failed due to user not found.',
      });
    if (code === RestorePasswordCodes.TransactionError)
      throw new InternalServerErrorException({
        message: 'Transaction error',
      });
  }

  @Post('restore-password-confirmation')
  @HttpCode(HttpStatus.OK)
  @RestorePasswordConfirmationSwagger()
  public async restorePasswordConfirmation(
    @Body() body: RestorePasswordConfirmationBodyInputDto,
  ) {
    const notification: Notification<null> = await this.commandBus.execute(
      new RestorePasswordConfirmationCommand(body.code, body.password),
    );
    const code = notification.getCode();
    if (code === RestorePasswordConfirmationCodes.Success)
      return {
        statusCode: HttpStatus.OK,
        message: 'Restore password confirmation successful',
      };
    if (code === RestorePasswordConfirmationCodes.ExpiredCode)
      throw new BadRequestException({
        error: 'restore_password_confirmation_failed',
        message: 'Restore password confirmation failed due to expired code.',
      });
    if (code === RestorePasswordConfirmationCodes.UnvalidCode)
      throw new BadRequestException({
        error: 'restore_password_confirmation_failed',
        message: 'Restore password confirmation failed due to unvalid code.',
      });
    if (code === RestorePasswordConfirmationCodes.TransactionError)
      throw new InternalServerErrorException({
        message: 'Transaction error',
      });
      
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @LoginSwagger()
  @ApiBody({ type: LoginDto })
  @Post('login')
  async login(
    @CurrentUserId() userId: string,
    @IpAddress() ip: string,
    @UserAgent() userAgent: string | undefined,
    @Res() response: Response,
  ) {
    if (!ip) {
      throw new NotFoundException({
        error: 'login failed',
        message: 'Unknown ip address',
        details: {
          ip: 'Invlid ip address',
        },
      });
    }
    const title = userAgent || 'Mozilla';
    const accesAndRefreshTokens = await this.commandBus.execute(
      new LoginUserCommand(userId, ip, title),
    );

    response
      .cookie('refreshToken', accesAndRefreshTokens.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .send({ accessToken: accesAndRefreshTokens.accessToken });
  }
}
