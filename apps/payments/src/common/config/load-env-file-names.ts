export const loadEnvFileNames = (): string[] => {
  if (process.env.NODE_ENV === 'development')
    return ['./apps/payments/.env.dev'];
  return [];
};
