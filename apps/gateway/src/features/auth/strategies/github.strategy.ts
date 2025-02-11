import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { LoggerService } from '@app/logger';

@Injectable()
// @LogClass({
//   level: 'trace',
//   loggerClassField: 'logger',
//   active: () => process.env.NODE_ENV !== 'production',
// })
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
    //@InjectCustomLoggerService() private readonly logger: CustomLoggerService,
    private readonly logger: LoggerService,
  ) {
    // super({
    //   clientID: process.env.GITHUB_CLIENT_ID,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET,
    //   callbackURL: process.env.GITHUB_CALLBACK_URL,
    //   scope: ['user:email'],
    // });
    super({
      clientID: configService.get('envSettings', { infer: true })
        .GITHUB_CLIENT_ID,
      clientSecret: configService.get('envSettings', { infer: true })
        .GITHUB_CLIENT_SECRET,
      callbackURL: configService.get('envSettings', { infer: true })
        .GITHUB_CALLBACK_URL,
      scope: ['user:email'],
    });
    this.logger.setContext(GithubStrategy.name);
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { id, username, displayName, emails } = profile;
    const user = {
      githubId: id,
      username,
      displayName,
      email: emails[0].value,
    };
    return user;
  }
}
