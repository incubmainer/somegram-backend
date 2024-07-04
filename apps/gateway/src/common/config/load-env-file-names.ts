export const loadEnvFileNames = (): string[] => {
  if (process.env.NODE_ENV === 'test') return ['./apps/gateway/.env.test'];
  if (process.env.NODE_ENV === 'development')
    return ['./apps/gateway/.env.dev'];
  return [];
};
