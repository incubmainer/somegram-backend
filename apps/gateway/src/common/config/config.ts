import { appConfig, AppConfig } from './configs/app.config';
import { AuthConfig, authConfig } from './configs/auth.config';
import { dbConfig, DbConfig } from './configs/db.config';
import { EmailConfig, emailConfig } from './configs/email.config';
import { filesConfig, FilesConfig } from './configs/files.config';
import {
  githubAuthConfig,
  GithubAuthConfig,
} from './configs/github-auth.config';
import { googleConfig, GoogleConfig } from './configs/google.config';
import { loggerConfig, LoggerConfig } from './configs/logger.config';

class FinalConfig {
  readonly db: DbConfig;
  readonly app: AppConfig;
  readonly email: EmailConfig;
  readonly auth: AuthConfig;
  readonly githubAuth: GithubAuthConfig;
  readonly google: GoogleConfig;
  readonly logger: LoggerConfig;
  readonly files: FilesConfig;
}

export const finalConfig = (): FinalConfig => {
  return {
    db: dbConfig(),
    app: appConfig(),
    email: emailConfig(),
    auth: authConfig(),
    githubAuth: githubAuthConfig(),
    google: googleConfig(),
    logger: loggerConfig(),
    files: filesConfig(),
  };
};
