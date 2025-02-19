import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../settings/configuration/configuration';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    super({
      clientID: configService.get('envSettings', { infer: true })
        .GITHUB_CLIENT_ID,
      clientSecret: configService.get('envSettings', { infer: true })
        .GITHUB_CLIENT_SECRET,
      callbackURL: configService.get('envSettings', { infer: true })
        .GITHUB_CALLBACK_URL,
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { id, username, displayName, emails } = profile;
    return {
      githubId: id,
      username,
      displayName,
      email: emails[0].value,
    };
  }
}
