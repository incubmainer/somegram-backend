import { appConfig, AppConfig } from './configs/app.config';
import { dbConfig, DbConfig } from './configs/db.config';
import { EmailConfig, emailConfig } from './configs/email.config';

class FinalConfig {
  readonly db: DbConfig;
  readonly app: AppConfig;
  readonly email: EmailConfig;
}

export const finalConfig = (): FinalConfig => {
  return {
    db: dbConfig(),
    app: appConfig(),
    email: emailConfig(),
  };
};
