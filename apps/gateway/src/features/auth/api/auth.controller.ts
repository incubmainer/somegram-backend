import {
  BadRequestException,
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
import { Request, Response } from 'express';
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
import { AuthGuard } from '@nestjs/passport';
import { GoogleProfile } from '../strategies/google.strategy';
import { GoogleUser } from './decorators/google-user.decorator';
import { GoogleAuthCallbackSwagger } from './swagger/google-auth-callback.swagger';
import { GithubAuthCallbackSwagger } from './swagger/github-auth-callback.swagger';
import { RenewTokensCommand } from '../application/use-cases/refresh-token-use-case';
import { RefreshTokenSwagger } from './swagger/refresh-token-swagger';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from 'apps/gateway/src/common/config/configs/auth.config';
import { RecaptchaSiteKeySwagger } from './swagger/recaptcha-site-key.swagger';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
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

@ApiTags('Auth')
@Controller('auth')
@LogClass({
  level: 'trace',
  loggerClassField: 'logger',
  active: () => process.env.NODE_ENV !== 'production',
})
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService,
    @InjectCustomLoggerService()
    private readonly logger: CustomLoggerService,
  ) {
    logger.setContext(AuthController.name);
  }

  @Post('registration')
  @HttpCode(HttpStatus.OK)
  @RegistrationSwagger()
  public async registration(@Body() body: RegistrationBodyInputDto) {
    this.logger.log('info', 'start registration', {});
    const notification: Notification<null> = await this.commandBus.execute(
      new RegistrationCommand(
        body.username,
        body.email,
        body.password,
        body.html,
      ),
    );
    const code = notification.getCode();
    if (code === RegistrationCodes.Success) {
      this.logger.log('info', 'registration success', {});
      return {
        statusCode: HttpStatus.OK,
        message: 'Registration successful',
      };
    }
    if (code === RegistrationCodes.EmailAlreadyExists) {
      this.logger.log('warn', 'email already exists', {});
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
      this.logger.log('warn', 'username already exists', {});
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
      this.logger.log('error', 'transaction error', {});
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Transaction error',
      });
    }
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RegistrationConfirmationSwagger()
  public async registrationConfirmation(
    @Body() body: RegistrationConfirmationBodyInputDto,
  ) {
    this.logger.log('info', 'start registration confirmation', {});
    const notification: Notification<null> = await this.commandBus.execute(
      new RegistrationConfirmationCommand(body.token),
    );
    const code = notification.getCode();
    if (code === RegistrationConfirmationCodes.Success) {
      this.logger.log('info', 'registration confirmation success', {});
      return;
    }
    if (code === RegistrationConfirmationCodes.TokenExpired) {
      this.logger.log('warn', 'token expired', {});
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'registration_confirmation_failed',
        message: 'Registration confirmation failed due to token expiration.',
      });
    }
    if (code === RegistrationConfirmationCodes.UserNotFound) {
      this.logger.log('warn', 'user not found', {});
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'User not found',
        message: 'User with confirmation token not found',
      });
    }
    if (code === RegistrationConfirmationCodes.TransactionError) {
      this.logger.log('error', 'transaction error', {});
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Transaction error',
      });
    }
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RegistrationEmailResendingSwagger()
  public async registrationEmailResending(
    @Body() body: RegistrationEmailResendingBodyInputDto,
  ) {
    this.logger.log('info', 'start registration-email-resending', {});
    const notification: Notification<null> = await this.commandBus.execute(
      new RegistrationEmailResendingCommand(body.token, body.html),
    );
    const code = notification.getCode();
    if (code === RegistrationEmailResendingCodes.Success) {
      this.logger.log('info', 'registration-email-resending success', {});
      return;
    }
    if (code === RegistrationEmailResendingCodes.EmailAlreadyConfirmated) {
      this.logger.log('warn', 'email already confirmated', {});
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'email_already_confirmated',
        message: 'User with current email already confirmed',
      });
    }
    if (code === RegistrationEmailResendingCodes.UserNotFound) {
      this.logger.log('warn', 'username not found', {});
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'User not found',
        message: 'User with current email not found',
      });
    }
    if (code === RegistrationEmailResendingCodes.TransactionError) {
      this.logger.log('error', 'transaction error', {});
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Transaction error',
      });
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
    this.logger.log('info', 'start google auth callback', {});
    const notification: Notification<string> = await this.commandBus.execute(
      new LoginByGoogleCommand(
        googleProfile.id,
        googleProfile.name,
        googleProfile.email,
        googleProfile.emailVerified,
      ),
    );
    const code = notification.getCode();
    if (code === LoginByGoogleCodes.WrongEmail) {
      this.logger.log('warn', 'wrong email', {});
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'login_by_google_failed',
        message: 'Login by google failed due to wrong email.',
      });
    }
    if (code === LoginByGoogleCodes.TransactionError) {
      this.logger.log('error', 'transaction error', {});
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Transaction error',
      });
    }
    if (!ip) {
      this.logger.log('warn', 'unknown ip address', {});
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

    const origin = request.headers.origin || 'http://localhost:3001';
    this.logger.log('info', 'google auth callback success', {});
    response
      .cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      .redirect(`${origin}/?accessToken=${tokens.accessToken}`);
  }

  @Get('recaptcha-site-key')
  @RecaptchaSiteKeySwagger()
  async recaptchaSiteKey() {
    this.logger.log('info', 'get recaptcha site key', {});
    const authConfig = this.configService.get<AuthConfig>('auth');
    return {
      recaptchaSiteKey: authConfig.recaptchaSiteKey,
    };
  }

  @Post('restore-password')
  @HttpCode(HttpStatus.OK)
  @RestorePasswordSwagger()
  public async restorePassword(@Body() body: RestorePasswordBodyInputDto) {
    this.logger.log('info', 'start restore password', {});
    const notification: Notification<null> = await this.commandBus.execute(
      new RestorePasswordCommand(body.email, body.recaptchaToken, body.html),
    );
    const code = notification.getCode();
    if (code === RestorePasswordCodes.Success) {
      this.logger.log('info', 'restore password success', {});
      return {
        statusCode: HttpStatus.OK,
        message: 'Restore password successful',
      };
    }
    if (code === RestorePasswordCodes.InvalidRecaptcha) {
      this.logger.log('warn', 'invalid recaptcha token', {});
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'invalid_recaptcha_token',
        message: 'Restore password failed due to invalid recaptcha token.',
      });
    }
    if (code === RestorePasswordCodes.UserNotFound) {
      this.logger.log('warn', 'user not found', {});
      throw new BadRequestException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'user_not_found',
        message: 'Restore password failed due to user not found.',
      });
    }
    if (code === RestorePasswordCodes.TransactionError) {
      this.logger.log('error', 'transaction error', {});
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Transaction error',
      });
    }
  }

  @Post('restore-password-confirmation')
  @HttpCode(HttpStatus.OK)
  @RestorePasswordConfirmationSwagger()
  public async restorePasswordConfirmation(
    @Body() body: RestorePasswordConfirmationBodyInputDto,
  ) {
    this.logger.log('info', 'start restore password confirmation', {});
    const notification: Notification<null> = await this.commandBus.execute(
      new RestorePasswordConfirmationCommand(body.code, body.password),
    );
    const code = notification.getCode();
    if (code === RestorePasswordConfirmationCodes.Success) {
      this.logger.log('info', 'restore password confirmation success', {});
      return {
        statusCode: HttpStatus.OK,
        message: 'Restore password confirmation successful',
      };
    }
    if (code === RestorePasswordConfirmationCodes.ExpiredCode) {
      this.logger.log('warn', 'expired code', {});
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'restore_password_confirmation_failed',
        message: 'Restore password confirmation failed due to expired code.',
      });
    }
    if (code === RestorePasswordConfirmationCodes.InvalidCode) {
      this.logger.log('warn', 'invalid code', {});
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'restore_password_confirmation_failed',
        message: 'Restore password confirmation failed due to Invalid code.',
      });
    }
    if (code === RestorePasswordConfirmationCodes.TransactionError) {
      this.logger.log('error', 'transaction error', {});
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Transaction error',
      });
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
    this.logger.log('info', 'start login', {});
    const tokens = await this.commandBus.execute(
      new LoginUserCommand(loginDto, userAgent, ip),
    );
    this.logger.log('info', 'login success', {});
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
    this.logger.log('info', 'start logout', {});
    const result = await this.commandBus.execute(
      new LogoutCommand(refreshToken),
    );
    this.logger.log('info', 'logout success', {});
    return result;
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @RefreshTokenSwagger()
  async renewTokens(
    @RefreshToken() refreshToken: string,
    @Res() res: Response,
  ) {
    this.logger.log('info', 'start refresh token', {});
    const tokens = await this.commandBus.execute(
      new RenewTokensCommand(refreshToken),
    );
    this.logger.log('info', 'refresh token success', {});
    return res
      .cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      .send({ accessToken: tokens.accessToken });
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
    this.logger.log('info', 'start github auth callback', {});
    const user: UserFromGithub = req.user;
    const notification: Notification<string> = await this.commandBus.execute(
      new AuthWithGithubCommand(user),
    );
    const code = notification.getCode();
    if (code === LoginWithGithubCodes.TransactionError) {
      this.logger.log('error', 'transaction error', {});
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Transaction error',
      });
    }
    if (!ip) {
      this.logger.log('warn', 'unknown ip address', {});
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

    const origin = req.headers.origin || 'http://localhost:3001';
    this.logger.log('info', 'github auth callback success', {});
    res
      .cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      .redirect(`${origin}/?accessToken=${tokens.accessToken}`);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @GetInfoAboutMeSwagger()
  @UseGuards(JwtAuthGuard)
  async getInfoAboutMe(@CurrentUserId() userId: string): Promise<MeOutputDto> {
    this.logger.log('info', 'start me request', {});
    const notification: Notification<MeOutputDto> =
      await this.commandBus.execute(new GetInfoAboutMeCommand(userId));
    const code = notification.getCode();
    if (code === MeCodes.TransactionError) {
      this.logger.log('error', 'transaction error', {});
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Transaction error',
      });
    }
    const outputUser = notification.getData();
    return outputUser;
  }
}
