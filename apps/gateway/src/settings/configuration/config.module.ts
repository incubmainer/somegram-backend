import { ConfigModule } from '@nestjs/config';
import configuration, { loadEnv, validate } from './configuration';

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [configuration],
  validate: validate,
  // ignoreEnvFile:
  //   process.env.ENV !== EnvState.DEVELOPMENT &&
  //   process.env.ENV !== EnvState.TESTING,
  //envFilePath: ['./apps/gateway/.env.dev'],
  envFilePath: loadEnv(),
  ignoreEnvFile: false,
});
