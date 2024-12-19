import { ConfigModule } from '@nestjs/config';
import configuration, { loadEnv, validate } from './configuration';

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [configuration],
  validate: validate,
  envFilePath: loadEnv(),
  ignoreEnvFile: false,
});
