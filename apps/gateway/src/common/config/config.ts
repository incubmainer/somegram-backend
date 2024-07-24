import { appConfig, AppConfig } from './configs/app.config';
import { AuthConfig, authConfig } from './configs/auth.config';
import { dbConfig, DbConfig } from './configs/db.config';
import { EmailConfig, emailConfig } from './configs/email.config';
import {
  FrontendUrlsConfig,
  frontendUrlsConfig,
} from './configs/frontend-urls';
import {
  githubAuthConfig,
  GithubAuthConfig,
} from './configs/github-auth.config';
import { googleConfig, GoogleConfig } from './configs/google.config';
import { s3Config, S3Config } from './configs/s3.config';

class FinalConfig {
  readonly db: DbConfig;
  readonly app: AppConfig;
  readonly email: EmailConfig;
  readonly frontendUrls: FrontendUrlsConfig;
  readonly auth: AuthConfig;
  readonly githubAuth: GithubAuthConfig;
  readonly google: GoogleConfig;
  readonly s3: S3Config;
}

export const finalConfig = (): FinalConfig => {
  return {
    db: dbConfig(),
    app: appConfig(),
    email: emailConfig(),
    frontendUrls: frontendUrlsConfig(),
    auth: authConfig(),
    githubAuth: githubAuthConfig(),
    google: googleConfig(),
    s3: s3Config(),
  };
};
