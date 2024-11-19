export const loadEnvFileNames = (): string[] => {
  if (process.env.NODE_ENV === 'development') return ['./apps/files/.env.dev'];
  return [];
};
