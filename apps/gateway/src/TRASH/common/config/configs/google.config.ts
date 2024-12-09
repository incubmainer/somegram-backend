export class GoogleConfig {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly redirectUri: string;
}

export const googleConfig = (): GoogleConfig => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID is not set');
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!redirectUri) throw new Error('GOOGLE_REDIRECT_URI is not set');
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientSecret) throw new Error('GOOGLE_CLIENT_SECRET is not set');
  return {
    clientId,
    redirectUri,
    clientSecret,
  };
};
