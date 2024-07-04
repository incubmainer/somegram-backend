import { appConfig, AppConfig } from './configs/app.config';
import { dbConfig, DbConfig } from './configs/db.config';

class FinalConfig {
  readonly db: DbConfig;
  readonly app: AppConfig;
}

export const finalConfig = (): FinalConfig => {
  return {
    db: dbConfig(),
    app: appConfig(),
  };
};
