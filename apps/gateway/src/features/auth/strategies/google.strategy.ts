import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { GoogleConfig } from 'apps/gateway/src/common/config/configs/google.config';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

export class GoogleProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<GoogleConfig>('google').clientId,
      clientSecret: configService.get<GoogleConfig>('google').clientSecret,
      callbackURL: configService.get<GoogleConfig>('google').redirectUri,
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
