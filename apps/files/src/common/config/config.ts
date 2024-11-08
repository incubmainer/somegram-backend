import { dbConfig, DbConfig } from './db.config';
import { S3Config, s3Config } from './s3.config';

class FilesConfig {
  readonly db: DbConfig;
  readonly s3: S3Config;
}

export const filesConfig = (): FilesConfig => {
  return {
    db: dbConfig(),
    s3: s3Config(),
  };
};
