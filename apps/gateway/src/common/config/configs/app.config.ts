export class AppConfig {
  readonly PORT: number;
  readonly GLOBAL_PREFIX: string;
  readonly SWAGGER_ENABLED: boolean;
}

const defaultPort = 3000;

export const appConfig = (): AppConfig => {
  const portStr = process.env.PORT;
  const port = portStr ? parseInt(portStr, 10) : defaultPort;
  if (isNaN(port)) throw new Error(`Invalid PORT: ${portStr}`);
  const GLOBAL_PREFIX = process.env.GLOBAL_PREFIX
    ? process.env.GLOBAL_PREFIX
    : '/';
  const SWAGGER_ENABLED = process.env.SWAGGER_ENABLED === 'true';
  return {
    PORT: port,
    GLOBAL_PREFIX,
    SWAGGER_ENABLED,
  };
};
