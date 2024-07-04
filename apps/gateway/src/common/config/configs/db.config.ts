export class DbConfig {
  readonly gatewayDatabaseUrl: string;
}

const pgRegex = /^postgres:\/\/[^:]+:[^@]+@[^:]+:\d+\/.+$/;

function isPostgresConnectionString(connectionString: string) {
  return pgRegex.test(connectionString);
}

export const dbConfig = (): DbConfig => {
  const databaseUrl = process.env.GATEWAY_DATABASE_URL;
  if (!databaseUrl) throw new Error('GATEWAY_DATABASE_URL is not set');
  if (!isPostgresConnectionString(databaseUrl))
    throw new Error(`Invalid database URL: ${databaseUrl}`);
  return {
    gatewayDatabaseUrl: databaseUrl,
  };
};
