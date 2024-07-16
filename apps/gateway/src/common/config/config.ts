import { appConfig, AppConfig } from './configs/app.config';
import { AuthConfig, authConfig } from './configs/auth.config';
import { dbConfig, DbConfig } from './configs/db.config';
import { EmailConfig, emailConfig } from './configs/email.config';
import {
  FrontendUrlsConfig,
  frontendUrlsConfig,
} from './configs/frontend-urls';
import { googleConfig, GoogleConfig } from './configs/google.config';

class FinalConfig {
  readonly db: DbConfig;
  readonly app: AppConfig;
  readonly email: EmailConfig;
  readonly frontendUrls: FrontendUrlsConfig;
  readonly auth: AuthConfig;
  readonly google: GoogleConfig;
}

export const finalConfig = (): FinalConfig => {
  return {
    db: dbConfig(),
    app: appConfig(),
    email: emailConfig(),
    frontendUrls: frontendUrlsConfig(),
    auth: authConfig(),
    google: googleConfig(),
  };
};
