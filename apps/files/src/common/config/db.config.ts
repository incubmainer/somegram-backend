export class DbConfig {
  readonly filesDatabaseUrl: string;
}

export const dbConfig = (): DbConfig => {
  const databaseUrl = process.env.PHOTO_DATABASE_URL;
  if (!databaseUrl) throw new Error('PHOTO_DATABASE_URL is not set');
  return {
    filesDatabaseUrl: databaseUrl,
  };
};
