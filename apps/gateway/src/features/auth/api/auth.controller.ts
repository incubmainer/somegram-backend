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
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { RegistrationCommand } from '../application/use-cases/registration.use-case';
import { RegistrationBodyInputDto } from './dto/input-dto/registration.body.input-dto';
import { RegistrationSwagger } from './swagger/registration.swagger';
import { LoginDto } from './dto/input-dto/login-user-with-device.dto';
import { LoginUserCommand } from '../application/use-cases/login-use-case';
import { LoginSwagger } from './swagger/login.swagger';
import { RegistrationConfirmationBodyInputDto } from './dto/input-dto/registration-confirmation.body.input-dto';
import { RegistrationConfirmationCommand } from '../application/use-cases/registration-confirmation.use-case';
import { RegistrationConfirmationSwagger } from './swagger/registration-confirmation.swagger';
import { RestorePasswordBodyInputDto } from './dto/input-dto/restore-password.body.input-dto';
import { RestorePasswordCommand } from '../application/use-cases/restore-password.use-case';
import { RestorePasswordSwagger } from './swagger/restore-password.swagger';
import { RestorePasswordConfirmationCommand } from '../application/use-cases/restore-password-confirmation.use-case';
import { RestorePasswordConfirmationBodyInputDto } from './dto/input-dto/restore-password-confirmation.body.input-dto';
import { RestorePasswordConfirmationSwagger } from './swagger/restore-password-confirmation.swagger';
import { IpAddress } from '../../../common/decorators/http-parse/ip-address.decorator';
import { UserAgent } from '../../../common/decorators/http-parse/user-agent.decorator';
import { LogoutCommand } from '../application/use-cases/logout-use-case';
import { LogOutSwagger } from './swagger/logout.swagger';
import { AuthWithGithubCommand } from '../application/use-cases/auth-with-github-use-case';
import { LoginByGoogleCommand } from '../application/use-cases/login-by-google.use-case';
import { GoogleProfile } from '../../../common/guards/jwt/google.strategy';
import { GoogleUser } from '../../../common/decorators/http-parse/google-user.decorator';
import { GoogleAuthCallbackSwagger } from './swagger/google-auth-callback.swagger';
import { GithubAuthCallbackSwagger } from './swagger/github-auth-callback.swagger';
import { RenewTokensCommand } from '../application/use-cases/refresh-token-use-case';
import { RefreshTokenSwagger } from './swagger/refresh-token-swagger';
import { RecaptchaSiteKeySwagger } from './swagger/recaptcha-site-key.swagger';
import { MeOutputDto } from './dto/output-dto/me-output-dto';
import { GetInfoAboutMeSwagger } from './swagger/get-info-about-me.swagger';
import { RegistrationEmailResendingSwagger } from './swagger/registration-email-resending.swagger';
import { RegistrationEmailResendingBodyInputDto } from './dto/input-dto/registration-email-resending.body.input-dto';
import { RegistrationEmailResendingCommand } from '../application/use-cases/registration-email-resending.use-case';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { LoggerService } from '@app/logger';
import { AUTH_ROUTE } from '../../../common/constants/route.constants';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { JWTRefreshTokenPayloadType, TokensPairType } from '../domain/types';
import { LoginOutputDto } from './dto/output-dto/login-outptu.dto';
import { CurrentUser } from '../../../common/decorators/http-parse/current-user.decorator';
import { RefreshJWTAccessGuard } from '../../../common/guards/jwt/jwt-refresh-auth-guard';
import { MeAccessTokenGuard } from '../../../common/guards/jwt/jwt-me-access-token.guard';
import { RecaptchaGuard } from '../../../common/guards/recaptcha.guard';
import { RecaptchaSiteKeyOutputDto } from './dto/output-dto/recaptcha-site-key-output.dto';
import { GithubUser } from '../../../common/decorators/http-parse/github-user.decorator';
import { GithubProfile } from '../../../common/guards/jwt/github.strategy';

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
      case AppNotificationResultEnum.Unauthorized:
        this.logger.debug('Unauthorized', this.registrationConfirmation.name);
        throw new UnauthorizedException();
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
    const result: AppNotificationResultType<null, string> =
      await this.commandBus.execute(
        new RegistrationEmailResendingCommand(body.token, body.html),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.registrationEmailResending.name);
        return;
      case AppNotificationResultEnum.BadRequest:
        this.logger.debug('Bad request', this.registrationEmailResending.name);
        throw new BadRequestException(result.errorField);
      case AppNotificationResultEnum.NotFound:
        this.logger.debug('Not found', this.registrationEmailResending.name);
        throw new NotFoundException(result.errorField);
      case AppNotificationResultEnum.Unauthorized:
        this.logger.debug('Unauthorized', this.registrationEmailResending.name);
        throw new UnauthorizedException();
      default:
        throw new InternalServerErrorException();
    }
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

    const result: AppNotificationResultType<TokensPairType, string> =
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
      case AppNotificationResultEnum.Unauthorized:
        this.logger.debug('Unauthorized', this.googleAuthCallback.name);
        throw new UnauthorizedException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Get(AUTH_ROUTE.RECAPTCHA_SITE_KEY)
  @RecaptchaSiteKeySwagger()
  async recaptchaSiteKey(): Promise<RecaptchaSiteKeyOutputDto> {
    this.logger.debug('Get recaptcha site key', this.recaptchaSiteKey.name);
    return {
      recaptchaSiteKey: this.configService.get('envSettings', {
        infer: true,
      }).RECAPTCHA_SITE_KEY,
    };
  }

  @Post(AUTH_ROUTE.RESTORE_PASSWORD)
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RecaptchaGuard)
  @RestorePasswordSwagger()
  public async restorePassword(
    @Body() body: RestorePasswordBodyInputDto,
  ): Promise<void> {
    this.logger.debug(
      'Execute: start restore password',
      this.restorePassword.name,
    );
    const result: AppNotificationResultType<null, string> =
      await this.commandBus.execute(
        new RestorePasswordCommand(body.email, body.html),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.restorePassword.name);
        return;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug('Not found', this.restorePassword.name);
        throw new NotFoundException(result.errorField);
      case AppNotificationResultEnum.Unauthorized:
        this.logger.debug('Unauthorized', this.restorePassword.name);
        throw new UnauthorizedException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Post(AUTH_ROUTE.RESTORE_PASSWORD_CONFIRM)
  @HttpCode(HttpStatus.NO_CONTENT)
  @RestorePasswordConfirmationSwagger()
  public async restorePasswordConfirmation(
    @Body() body: RestorePasswordConfirmationBodyInputDto,
  ): Promise<void> {
    this.logger.debug(
      'Execute: start restore password confirmation',
      this.restorePasswordConfirmation.name,
    );
    const result: AppNotificationResultType<null, string> =
      await this.commandBus.execute(
        new RestorePasswordConfirmationCommand(body.code, body.password),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.restorePasswordConfirmation.name);
        return;
      case AppNotificationResultEnum.BadRequest:
        this.logger.debug('Bad request', this.restorePasswordConfirmation.name);
        throw new BadRequestException(result.errorField);
      case AppNotificationResultEnum.Unauthorized:
        this.logger.debug(
          'Unauthorized',
          this.restorePasswordConfirmation.name,
        );
        throw new UnauthorizedException();
      default:
        throw new InternalServerErrorException();
    }
  }

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

  @Post(AUTH_ROUTE.LOGOUT)
  @UseGuards(RefreshJWTAccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @LogOutSwagger()
  async logout(
    @CurrentUser() user: JWTRefreshTokenPayloadType,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
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

  @Get(AUTH_ROUTE.GITHUB)
  @UseGuards(AuthGuard('github'))
  async githubAuth(): Promise<void> {}

  @Get(`${AUTH_ROUTE.GITHUB}/${AUTH_ROUTE.CALLBACK}`)
  @UseGuards(AuthGuard('github'))
  @GithubAuthCallbackSwagger()
  async githubAuthCallback(
    @GithubUser() user: GithubProfile,
    @Res() response: Response,
    @IpAddress() ip?: string,
    @UserAgent() userAgent?: string,
  ): Promise<void> {
    this.logger.debug(
      'Execute: start github auth callback',
      this.githubAuthCallback.name,
    );

    const result: AppNotificationResultType<TokensPairType> =
      await this.commandBus.execute(
        new AuthWithGithubCommand(user, ip, userAgent),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.githubAuthCallback.name);
        const { accessToken, refreshToken } = result.data;
        response
          .cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
          })
          .redirect(`${this.frontendProvider}/?accessToken=${accessToken}`);
        return;
      case AppNotificationResultEnum.BadRequest:
        this.logger.debug('Bad request', this.githubAuthCallback.name);
        throw new BadRequestException(result.errorField);
      case AppNotificationResultEnum.Unauthorized:
        this.logger.debug('Unauthorized', this.githubAuthCallback.name);
        throw new UnauthorizedException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Get(AUTH_ROUTE.ME)
  @HttpCode(HttpStatus.OK)
  @GetInfoAboutMeSwagger()
  @UseGuards(MeAccessTokenGuard)
  async getInfoAboutMe(@CurrentUser() user: MeOutputDto): Promise<MeOutputDto> {
    return user;
  }
}
