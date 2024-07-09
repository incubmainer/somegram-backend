export class AppConfig {
  readonly PORT: number;
  readonly GLOBAL_PREFIX: string;
}

const defaultPort = 3000;

export const appConfig = (): AppConfig => {
  const portStr = process.env.PORT;
  const port = portStr ? parseInt(portStr, 10) : defaultPort;
  if (isNaN(port)) throw new Error(`Invalid PORT: ${portStr}`);
  const GLOBAL_PREFIX = process.env.GLOBAL_PREFIX
    ? process.env.GLOBAL_PREFIX
    : '/';
  return {
    PORT: port,
    GLOBAL_PREFIX,
  };
};
