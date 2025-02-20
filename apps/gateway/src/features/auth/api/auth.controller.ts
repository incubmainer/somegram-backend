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
import { RegistrationCommand } from '../application/use-cases/registration.use-case';
import { JwtAuthGuard } from '../../../common/guards/jwt/jwt-auth.guard';
import { RegistrationBodyInputDto } from './dto/input-dto/registration.body.input-dto';
import { RegistrationSwagger } from './swagger/registration.swagger';
import { LoginDto } from './dto/input-dto/login-user-with-device.dto';
import { LoginUserCommand } from '../application/use-cases/login-use-case';
import { LoginSwagger } from './swagger/login.swagger';
import { RegistrationConfirmationBodyInputDto } from './dto/input-dto/registration-confirmation.body.input-dto';
import { RegistrationConfirmationCommand } from '../application/use-cases/registration-confirmation.use-case';
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
import { CurrentUserId } from '../../../common/decorators/http-parse/current-user-id-param.decorator';
import { IpAddress } from '../../../common/decorators/http-parse/ip-address.decorator';
import { UserAgent } from '../../../common/decorators/http-parse/user-agent.decorator';
import { LogoutCommand } from '../application/use-cases/logout-use-case';
import { LogOutSwagger } from './swagger/logout.swagger';
import { RefreshToken } from '../../../common/decorators/http-parse/refresh-token.decorator';
import { UserFromGithub } from './dto/input-dto/user-from-github';
import {
  AuthWithGithubCommand,
  LoginWithGithubCodes,
} from '../application/use-cases/auth-with-github-use-case';
import { LoginByGoogleCommand } from '../application/use-cases/login-by-google.use-case';
import { GoogleProfile } from '../../../common/guards/jwt/google.strategy';
import { GoogleUser } from '../../../common/decorators/http-parse/google-user.decorator';
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
import { RegistrationEmailResendingCommand } from '../application/use-cases/registration-email-resending.use-case';
import { CreateTokensCommand } from '../application/use-cases/create-token.use-case';
import { AddUserDeviceCommand } from '../application/use-cases/add-user-device.use-case';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { LoggerService } from '@app/logger';
import { AUTH_ROUTE } from '../../../common/constants/route.constants';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import {
  JWTRefreshTokenPayloadType,
  JWTTokensType,
} from '../../../common/domain/types/types';
import { TokensPairType } from '../domain/types';
import { LoginOutputDto } from './dto/output-dto/login-outptu.dto';
import { CurrentUser } from '../../../common/decorators/http-parse/current-user.decorator';
import { RefreshJWTAccessGuard } from '../../../common/guards/jwt/jwt-refresh-auth-guard';
import { MeAccessTokenGuard } from '../../../common/guards/jwt/jwt-me-access-token.guard';

@ApiTags('Auth')
@Controller(AUTH_ROUTE.MAIN)
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

  @Post(AUTH_ROUTE.REGISTRATION)
  @HttpCode(HttpStatus.NO_CONTENT)
  @RegistrationSwagger()
  public async registration(
    @Body() body: RegistrationBodyInputDto,
  ): Promise<void> {
    this.logger.debug('Execute: start registration', this.registration.name);
    const result: AppNotificationResultType<null, string> =
      await this.commandBus.execute(new RegistrationCommand(body));

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.registration.name);
        return;
      case AppNotificationResultEnum.BadRequest:
        this.logger.debug('Bad request', this.registration.name);
        throw new BadRequestException(result.errorField);
      default:
        throw new InternalServerErrorException();
    }
  }

  @Post(AUTH_ROUTE.REGISTRATION_CONFIRMATION)
  @HttpCode(HttpStatus.NO_CONTENT)
  @RegistrationConfirmationSwagger()
  public async registrationConfirmation(
    @Body() body: RegistrationConfirmationBodyInputDto,
  ): Promise<void> {
    this.logger.debug(
      'Execute: start registration confirmation',
      this.registrationConfirmation.name,
    );

    const result: AppNotificationResultType<null> =
      await this.commandBus.execute(
        new RegistrationConfirmationCommand(body.token),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.registrationConfirmation.name);
        return;
      case AppNotificationResultEnum.BadRequest:
        this.logger.debug('Bad request', this.registrationConfirmation.name);
        throw new BadRequestException(result.errorField);
      case AppNotificationResultEnum.NotFound:
        this.logger.debug('Not found', this.registrationConfirmation.name);
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Post(AUTH_ROUTE.REGISTRATION_EMAIL_RESENDING)
  @HttpCode(HttpStatus.NO_CONTENT)
  @RegistrationEmailResendingSwagger()
  public async registrationEmailResending(
    @Body() body: RegistrationEmailResendingBodyInputDto,
  ): Promise<void> {
    this.logger.debug(
      'Execute: start registration-email-resending',
      this.registrationEmailResending.name,
    );
    const result = await this.commandBus.execute(
      new RegistrationEmailResendingCommand(body.token, body.html),
    );

    // const notification: NotificationObject<null> =
    //   await this.commandBus.execute(
    //     new RegistrationEmailResendingCommand(body.token, body.html),
    //   );
    // const code = notification.getCode();
    // if (code === RegistrationEmailResendingCodes.Success) {
    //   this.logger.debug(
    //     'registration-email-resending success',
    //     this.registrationEmailResending.name,
    //   );
    //   return;
    // }
    // if (code === RegistrationEmailResendingCodes.EmailAlreadyConfirmated) {
    //   this.logger.debug(
    //     'email already confirmed',
    //     this.registrationEmailResending.name,
    //   );
    //   throw new BadRequestException({
    //     statusCode: HttpStatus.BAD_REQUEST,
    //     error: 'email_already_confirmated',
    //     message: 'User with current email already confirmed',
    //   });
    // }
    // if (code === RegistrationEmailResendingCodes.UserNotFound) {
    //   this.logger.debug(
    //     'username not found',
    //     this.registrationEmailResending.name,
    //   );
    //   throw new BadRequestException({
    //     statusCode: HttpStatus.BAD_REQUEST,
    //     error: 'User not found',
    //     message: 'User with current email not found',
    //   });
    // }
    // if (code === RegistrationEmailResendingCodes.TransactionError) {
    //   this.logger.error(
    //     'transaction error',
    //     this.registrationEmailResending.name,
    //   );
    //   throw new InternalServerErrorException();
    // }
  }

  @Get(AUTH_ROUTE.GOOGLE)
  @UseGuards(AuthGuard('google'))
  async googleAuth(): Promise<void> {}

  @Get(`${AUTH_ROUTE.GOOGLE}/${AUTH_ROUTE.CALLBACK}`)
  @UseGuards(AuthGuard('google'))
  @GoogleAuthCallbackSwagger()
  async googleAuthCallback(
    @GoogleUser() googleProfile: GoogleProfile | null,
    @Res() response: Response,
    @IpAddress() ip?: string,
    @UserAgent() userAgent?: string,
  ): Promise<void> {
    this.logger.debug(
      'Execute: start google auth callback',
      this.googleAuthCallback.name,
    );

    const result: AppNotificationResultType<JWTTokensType, string> =
      await this.commandBus.execute(
        new LoginByGoogleCommand(googleProfile, ip, userAgent),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.googleAuthCallback.name);
        response
          .cookie('refreshToken', result.data.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
          })
          .redirect(
            `${this.frontendProvider}/?accessToken=${result.data.accessToken}`,
          );
        return;
      case AppNotificationResultEnum.BadRequest:
        this.logger.debug('Bad Request', this.googleAuthCallback.name);
        throw new BadRequestException(result.errorField);
      default:
        throw new InternalServerErrorException();
    }
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
    // @ts-ignore // TODO:
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
    // @ts-ignore // TODO:
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

  // TODO: DONE
  @Post(AUTH_ROUTE.LOGIN)
  @HttpCode(HttpStatus.OK)
  @LoginSwagger()
  async login(
    @Body() loginDto: LoginDto,
    @IpAddress() ip: string,
    @UserAgent() userAgent: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginOutputDto> {
    this.logger.debug('Execute: start login', this.login.name);
    const result: AppNotificationResultType<TokensPairType, null> =
      await this.commandBus.execute(
        new LoginUserCommand(loginDto, userAgent, ip),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.login.name);
        const { accessToken, refreshToken } = result.data;
        response.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
        });

        return { accessToken };
      case AppNotificationResultEnum.Unauthorized:
        this.logger.debug('Unauthorized', this.login.name);
        throw new UnauthorizedException();

      default:
        throw new InternalServerErrorException();
    }
  }

  // TODO: DONE
  @Post(AUTH_ROUTE.LOGOUT)
  @UseGuards(RefreshJWTAccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @LogOutSwagger()
  async logout(
    @CurrentUser() user: JWTRefreshTokenPayloadType,
    @Res({ passthrough: true }) response: Response,
  ): Promise<boolean> {
    this.logger.debug('Execute: start logout', this.logout.name);

    const result: AppNotificationResultType<null, null> =
      await this.commandBus.execute(new LogoutCommand(user));

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.logout.name);
        response.clearCookie('refreshToken');
        return;
      default:
        throw new InternalServerErrorException();
    }
  }

  // TODO: DONE
  @Post(AUTH_ROUTE.UPDATE_TOKENS)
  @UseGuards(RefreshJWTAccessGuard)
  @HttpCode(HttpStatus.OK)
  @RefreshTokenSwagger()
  async renewTokens(
    @CurrentUser() user: JWTRefreshTokenPayloadType,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginOutputDto> {
    this.logger.debug('Execute: start refresh token', this.renewTokens.name);
    const result: AppNotificationResultType<TokensPairType, null> =
      await this.commandBus.execute(new RenewTokensCommand(user));

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.renewTokens.name);
        const { accessToken, refreshToken } = result.data;
        response.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
        });
        return { accessToken };
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
    // @ts-ignore // TODO:
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

  // TODO: DONE
  @Get(AUTH_ROUTE.ME)
  @HttpCode(HttpStatus.OK)
  @GetInfoAboutMeSwagger()
  @UseGuards(MeAccessTokenGuard)
  async getInfoAboutMe(@CurrentUser() user: MeOutputDto): Promise<MeOutputDto> {
    return user;
  }
}
