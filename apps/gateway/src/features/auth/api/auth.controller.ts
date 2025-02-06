import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  NotFoundException,
  Get,
  Req,
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import {
  RegistrationCodes,
  RegistrationCommand,
} from '../application/use-cases/registration.use-case';
import { NotificationObject } from 'apps/gateway/src/common/domain/notification';
import { RegistrationBodyInputDto } from './dto/input-dto/registration.body.input-dto';
import { RegistrationSwagger } from './swagger/registration.swagger';
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
import { LogoutCommand } from '../application/use-cases/logout-use-case';
import { LogOutSwagger } from './swagger/logout.swagger';
import { RefreshToken } from './decorators/refresh-token.decorator';
import { UserFromGithub } from './dto/input-dto/user-from-github';
import {
  AuthWithGithubCommand,
  LoginWithGithubCodes,
} from '../application/use-cases/auth-with-github-use-case';
import {
  LoginByGoogleCodes,
  LoginByGoogleCommand,
} from '../application/use-cases/login-by-google.use-case';
import { GoogleProfile } from '../strategies/google.strategy';
import { GoogleUser } from './decorators/google-user.decorator';
import { GoogleAuthCallbackSwagger } from './swagger/google-auth-callback.swagger';
import { GithubAuthCallbackSwagger } from './swagger/github-auth-callback.swagger';
import { RenewTokensCommand } from '../application/use-cases/refresh-token-use-case';
import { RefreshTokenSwagger } from './swagger/refresh-token-swagger';
import { RecaptchaSiteKeySwagger } from './swagger/recaptcha-site-key.swagger';
import {
  GetInfoAboutMeCommand,
  MeCodes,
} from '../application/use-cases/get-info-about-me.use-case';
import { MeOutputDto } from './dto/output-dto/me-output-dto';
import { GetInfoAboutMeSwagger } from './swagger/get-info-about-me.swagger';
import { RegistrationEmailResendingSwagger } from './swagger/registration-email-resending.swagger';
import { RegistrationEmailResendingBodyInputDto } from './dto/input-dto/registration-email-resending.body.input-dto';
import {
  RegistrationEmailResendingCodes,
  RegistrationEmailResendingCommand,
} from '../application/use-cases/registration-email-resending.use-case';
import { CreateTokensCommand } from '../application/use-cases/create-token.use-case';
import { AddUserDeviceCommand } from '../application/use-cases/add-user-device.use-case';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { LoggerService } from '@app/logger';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { JWTTokensType } from '../../../common/domain/types/types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly frontendProvider: string;
  constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AuthController.name);
    this.frontendProvider = this.configService.get('envSettings', {
      infer: true,
    }).FRONTED_PROVIDER;
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RegistrationSwagger()
  public async registration(@Body() body: RegistrationBodyInputDto) {
    this.logger.debug('start registration', this.registration.name);
    const notification: NotificationObject<null> =
      await this.commandBus.execute(
        new RegistrationCommand(
          body.username,
          body.email,
          body.password,
          body.html,
        ),
      );
    const code = notification.getCode();
    if (code === RegistrationCodes.Success) {
      this.logger.debug('registration success', this.registration.name);
      return;
    }
    if (code === RegistrationCodes.EmailAlreadyExists) {
      this.logger.debug('email already exists', this.registration.name);
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'registration_failed',
        message:
          'Registration failed due to conflict with existing email or username.',
        details: {
          email: 'Email address is already in use.',
        },
      });
    }
    if (code === RegistrationCodes.UsernameAlreadyExists) {
      this.logger.debug('username already exists', this.registration.name);
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'registration_failed',
        message:
          'Registration failed due to conflict with existing email or username.',
        details: {
          username: 'Username is already taken.',
        },
      });
    }
    if (code === RegistrationCodes.TransactionError) {
      this.logger.error('transaction error', this.registration.name);
      throw new InternalServerErrorException();
    }
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RegistrationConfirmationSwagger()
  public async registrationConfirmation(
    @Body() body: RegistrationConfirmationBodyInputDto,
  ) {
    this.logger.debug(
      'start registration confirmation',
      this.registrationConfirmation.name,
    );
    const notification: NotificationObject<null> =
      await this.commandBus.execute(
        new RegistrationConfirmationCommand(body.token),
      );
    const code = notification.getCode();
    if (code === RegistrationConfirmationCodes.Success) {
      this.logger.debug(
        'registration confirmation success',
        this.registrationConfirmation.name,
      );
      return;
    }
    if (code === RegistrationConfirmationCodes.TokenExpired) {
      this.logger.debug('token expired', this.registrationConfirmation.name);
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'registration_confirmation_failed',
        message: 'Registration confirmation failed due to token expiration.',
      });
    }
    if (code === RegistrationConfirmationCodes.UserNotFound) {
      this.logger.debug('user not found', this.registrationConfirmation.name);
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'User not found',
        message: 'User with confirmation token not found',
      });
    }
    if (code === RegistrationConfirmationCodes.TransactionError) {
      this.logger.error(
        'transaction error',
        this.registrationConfirmation.name,
      );
      throw new InternalServerErrorException();
    }
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RegistrationEmailResendingSwagger()
  public async registrationEmailResending(
    @Body() body: RegistrationEmailResendingBodyInputDto,
  ) {
    this.logger.debug(
      'start registration-email-resending',
      this.registrationEmailResending.name,
    );
    const notification: NotificationObject<null> =
      await this.commandBus.execute(
        new RegistrationEmailResendingCommand(body.token, body.html),
      );
    const code = notification.getCode();
    if (code === RegistrationEmailResendingCodes.Success) {
      this.logger.debug(
        'registration-email-resending success',
        this.registrationEmailResending.name,
      );
      return;
    }
    if (code === RegistrationEmailResendingCodes.EmailAlreadyConfirmated) {
      this.logger.debug(
        'email already confirmed',
        this.registrationEmailResending.name,
      );
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'email_already_confirmated',
        message: 'User with current email already confirmed',
      });
    }
    if (code === RegistrationEmailResendingCodes.UserNotFound) {
      this.logger.debug(
        'username not found',
        this.registrationEmailResending.name,
      );
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'User not found',
        message: 'User with current email not found',
      });
    }
    if (code === RegistrationEmailResendingCodes.TransactionError) {
      this.logger.error(
        'transaction error',
        this.registrationEmailResending.name,
      );
      throw new InternalServerErrorException();
    }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @GoogleAuthCallbackSwagger()
  async googleAuthCallback(
    @GoogleUser() googleProfile: GoogleProfile | null,
    @Res() response: Response,
    @Req() request: Request,
    @IpAddress() ip?: string,
    @UserAgent() userAgent?: string,
  ): Promise<any> {
    this.logger.debug(
      'start google auth callback',
      this.googleAuthCallback.name,
    );
    const notification: NotificationObject<string> =
      await this.commandBus.execute(
        new LoginByGoogleCommand(
          googleProfile.id,
          googleProfile.name,
          googleProfile.email,
          googleProfile.emailVerified,
        ),
      );
    const code = notification.getCode();
    if (code === LoginByGoogleCodes.WrongEmail) {
      this.logger.debug('wrong email', this.googleAuthCallback.name);
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'login_by_google_failed',
        message: 'Login by google failed due to wrong email.',
      });
    }
    if (code === LoginByGoogleCodes.TransactionError) {
      this.logger.error('transaction error', this.googleAuthCallback.name);
      throw new InternalServerErrorException();
    }
    if (!ip) {
      this.logger.debug('unknown ip address', this.googleAuthCallback.name);
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'login failed',
        message: 'Unknown ip address',
        details: {
          ip: 'Invlid ip address',
        },
      });
    }
    const userId = notification.getData();
    const tokens = await this.commandBus.execute(
      new CreateTokensCommand(userId),
    );

    await this.commandBus.execute(
      new AddUserDeviceCommand(tokens.refreshToken, userAgent, ip),
    );

    this.logger.debug(
      'google auth callback success',
      this.googleAuthCallback.name,
    );
    response
      .cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      .redirect(`${this.frontendProvider}/?accessToken=${tokens.accessToken}`);
  }

  @Get('recaptcha-site-key')
  @RecaptchaSiteKeySwagger()
  async recaptchaSiteKey() {
    this.logger.debug('get recaptcha site key', this.recaptchaSiteKey.name);
    //const authConfig = this.configService.get<AuthConfig>('auth');
    //  return {
    //    recaptchaSiteKey: authConfig.recaptchaSiteKey,
    //  };

    return {
      recaptchaSiteKey: this.configService.get('envSettings', {
        infer: true,
      }).RECAPTCHA_SITE_KEY,
    };
  }

  @Post('restore-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RestorePasswordSwagger()
  public async restorePassword(@Body() body: RestorePasswordBodyInputDto) {
    this.logger.debug('start restore password', this.restorePassword.name);
    const notification: NotificationObject<null> =
      await this.commandBus.execute(
        new RestorePasswordCommand(body.email, body.recaptchaToken, body.html),
      );
    const code = notification.getCode();
    if (code === RestorePasswordCodes.Success) {
      this.logger.debug('restore password success', this.restorePassword.name);
      return;
    }
    if (code === RestorePasswordCodes.InvalidRecaptcha) {
      this.logger.debug('invalid recaptcha token', this.restorePassword.name);
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'invalid_recaptcha_token',
        message: 'Restore password failed due to invalid recaptcha token.',
      });
    }
    if (code === RestorePasswordCodes.UserNotFound) {
      this.logger.debug('user not found', this.restorePassword.name);
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'user_not_found',
        message: 'Restore password failed due to user not found.',
      });
    }
    if (code === RestorePasswordCodes.TransactionError) {
      this.logger.error('transaction error', this.restorePassword.name);
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Transaction error',
      });
    }
  }

  @Post('restore-password-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RestorePasswordConfirmationSwagger()
  public async restorePasswordConfirmation(
    @Body() body: RestorePasswordConfirmationBodyInputDto,
  ) {
    this.logger.debug(
      'start restore password confirmation',
      this.restorePasswordConfirmation.name,
    );
    const notification: NotificationObject<null> =
      await this.commandBus.execute(
        new RestorePasswordConfirmationCommand(body.code, body.password),
      );
    const code = notification.getCode();
    if (code === RestorePasswordConfirmationCodes.Success) {
      this.logger.debug(
        'restore password confirmation success',
        this.restorePasswordConfirmation.name,
      );
      return;
    }
    if (code === RestorePasswordConfirmationCodes.ExpiredCode) {
      this.logger.debug('expired code', this.restorePasswordConfirmation.name);
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'restore_password_confirmation_failed',
        message: 'Restore password confirmation failed due to expired code.',
      });
    }
    if (code === RestorePasswordConfirmationCodes.InvalidCode) {
      this.logger.debug('invalid code', this.restorePasswordConfirmation.name);
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'restore_password_confirmation_failed',
        message: 'Restore password confirmation failed due to Invalid code.',
      });
    }
    if (code === RestorePasswordConfirmationCodes.TransactionError) {
      this.logger.error(
        'transaction error',
        this.restorePasswordConfirmation.name,
      );
      throw new InternalServerErrorException();
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @LoginSwagger()
  @ApiBody({ type: LoginDto })
  async login(
    @Body() loginDto: LoginDto,
    @IpAddress() ip: string,
    @UserAgent() userAgent: string,
    @Res() response: Response,
  ) {
    this.logger.debug('start login', this.login.name);
    const tokens = await this.commandBus.execute(
      new LoginUserCommand(loginDto, userAgent, ip),
    );
    this.logger.debug('login success', this.login.name);
    response
      .cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      .send({ accessToken: tokens.accessToken });
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @LogOutSwagger()
  async logout(@RefreshToken() refreshToken: string): Promise<boolean> {
    this.logger.debug('start logout', this.logout.name);
    await this.commandBus.execute(new LogoutCommand(refreshToken));
    this.logger.debug('logout success', this.logout.name);
    return;
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @RefreshTokenSwagger()
  async renewTokens(
    @RefreshToken() refreshToken: string,
    @Res() res: Response,
  ) {
    this.logger.debug('start refresh token', this.renewTokens.name);
    const result: AppNotificationResultType<JWTTokensType> =
      await this.commandBus.execute(new RenewTokensCommand(refreshToken));

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('refresh token success', this.renewTokens.name);
        return res
          .cookie('refreshToken', result.data.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
          })
          .send({ accessToken: result.data.accessToken });
      case AppNotificationResultEnum.Unauthorized:
        this.logger.debug(`Unauthorized`, this.renewTokens.name);
        throw new UnauthorizedException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @GithubAuthCallbackSwagger()
  async githubAuthCallback(
    @Req() req,
    @Res() res: Response,
    @IpAddress() ip?: string,
    @UserAgent() userAgent?: string,
  ) {
    this.logger.debug(
      'start github auth callback',
      this.githubAuthCallback.name,
    );
    const user: UserFromGithub = req.user;
    const notification: NotificationObject<string> =
      await this.commandBus.execute(new AuthWithGithubCommand(user));
    const code = notification.getCode();
    if (code === LoginWithGithubCodes.TransactionError) {
      this.logger.error('transaction error', this.githubAuthCallback.name);
      throw new InternalServerErrorException();
    }
    if (!ip) {
      this.logger.debug('unknown ip address', this.githubAuthCallback.name);
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'login failed',
        message: 'Unknown ip address',
        details: {
          ip: 'Invlid ip address',
        },
      });
    }
    const userId = notification.getData();
    const tokens = await this.commandBus.execute(
      new CreateTokensCommand(userId),
    );

    await this.commandBus.execute(
      new AddUserDeviceCommand(tokens.refreshToken, userAgent, ip),
    );

    this.logger.debug(
      'github auth callback success',
      this.githubAuthCallback.name,
    );
    res
      .cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      .redirect(`${this.frontendProvider}/?accessToken=${tokens.accessToken}`);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @GetInfoAboutMeSwagger()
  @UseGuards(JwtAuthGuard)
  async getInfoAboutMe(@CurrentUserId() userId: string): Promise<MeOutputDto> {
    this.logger.debug('start me request', this.getInfoAboutMe.name);
    const notification: NotificationObject<MeOutputDto> =
      await this.commandBus.execute(new GetInfoAboutMeCommand(userId));
    const code = notification.getCode();
    if (code === MeCodes.TransactionError) {
      this.logger.error('transaction error', this.getInfoAboutMe.name);
      throw new InternalServerErrorException();
    }
    const outputUser = notification.getData();
    return outputUser;
  }
}
