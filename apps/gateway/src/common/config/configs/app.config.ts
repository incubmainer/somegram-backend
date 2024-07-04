export class AppConfig {
  readonly PORT: number;
}

const defaultPort = 3000;

export const appConfig = (): AppConfig => {
  const portStr = process.env.PORT;
  const port = portStr ? parseInt(portStr, 10) : defaultPort;
  if (isNaN(port)) throw new Error(`Invalid PORT: ${portStr}`);
  return {
    PORT: port,
  };
};
