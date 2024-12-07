import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { GoogleConfig } from 'apps/gateway/src/common/config/configs/google.config';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { LoggerService } from '@app/logger';

export class GoogleProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
// @LogClass({
//   level: 'trace',
//   loggerClassField: 'logger',
//   active: () => process.env.NODE_ENV !== 'production',
// })
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    //private readonly configService: ConfigService,
    private readonly configService: ConfigService<ConfigurationType, true>,
    //@InjectCustomLoggerService() private readonly logger: CustomLoggerService,
    private readonly logger: LoggerService,
  ) {
    // super({
    //   clientID: configService.get<GoogleConfig>('google').clientId,
    //   clientSecret: configService.get<GoogleConfig>('google').clientSecret,
    //   callbackURL: configService.get<GoogleConfig>('google').redirectUri,
    //   scope: ['email', 'profile'],
    // });
    super({
      clientID: configService.get('envSettings', { infer: true })
        .GOOGLE_CLIENT_ID,
      clientSecret: configService.get('envSettings', { infer: true })
        .GOOGLE_CLIENT_SECRET,
      callbackURL: configService.get('envSettings', { infer: true })
        .GOOGLE_REDIRECT_URI,
      scope: ['email', 'profile'],
    });
    this.logger.setContext(GoogleStrategy.name);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    const user: GoogleProfile = {
      id: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      emailVerified: profile.emails[0].verified,
      accessToken,
      refreshToken,
    };
    done(null, { googleProfile: user });
  }
}
