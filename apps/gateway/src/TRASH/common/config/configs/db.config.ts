export class DbConfig {
  readonly gatewayDatabaseUrl: string;
}

export const dbConfig = (): DbConfig => {
  const databaseUrl = process.env.GATEWAY_DATABASE_URL;
  if (!databaseUrl) throw new Error('GATEWAY_DATABASE_URL is not set');
  return {
    gatewayDatabaseUrl: databaseUrl,
  };
};
