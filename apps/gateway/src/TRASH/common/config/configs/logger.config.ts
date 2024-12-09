export class LoggerConfig {
  readonly loggerLevel: string;
}

export const loggerConfig = (): LoggerConfig => {
  const loggerLevel = process.env.LOGGER_LEVEL || 'info';
  return {
    loggerLevel: loggerLevel,
  };
};
