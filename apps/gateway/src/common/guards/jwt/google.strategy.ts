import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigurationType } from '../../../settings/configuration/configuration';

export class GoogleProfile {
  googleId: string;
  googleName: string;
  googleEmail: string;
  googleEmailVerified: boolean;
  googleAccessToken: string;
  googleRefreshToken: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    super({
      clientID: configService.get('envSettings', { infer: true })
        .GOOGLE_CLIENT_ID,
      clientSecret: configService.get('envSettings', { infer: true })
        .GOOGLE_CLIENT_SECRET,
      callbackURL: configService.get('envSettings', { infer: true })
        .GOOGLE_REDIRECT_URI,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    const user: GoogleProfile = {
      googleId: profile.id,
      googleName: profile.displayName,
      googleEmail: profile.emails[0].value,
      googleEmailVerified: profile.emails[0].verified,
      googleAccessToken: accessToken,
      googleRefreshToken: refreshToken,
    };
    done(null, { googleProfile: user });
  }
}
