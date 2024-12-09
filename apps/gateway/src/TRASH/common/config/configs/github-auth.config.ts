export class GithubAuthConfig {
  readonly githubClientSicret: string;
  readonly githubClientId: string;
  readonly githubCallbackUrl: string;
}

export const githubAuthConfig = (): GithubAuthConfig => {
  const githubClientSicret = process.env.GITHUB_CLIENT_SECRET;
  if (!githubClientSicret) {
    throw new Error('GITHUB_CLIENT_SECRET is not defined');
  }
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  {
    if (!githubClientId) throw new Error('GITHUB_CLIENT_ID is not defined');
  }
  const githubCallbackUrl = process.env.GITHUB_CALLBACK_URL;
  if (!githubCallbackUrl) {
    throw new Error('GITHUB_CALLBACK_URL is not defined');
  }
  return {
    githubClientSicret,
    githubClientId,
    githubCallbackUrl,
  };
};
