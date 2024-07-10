export class FrontendUrlsConfig {
  readonly FRONTEND_REGISTRATION_CONFIRMATION_URL: string;
}

export const frontendUrlsConfig = (): FrontendUrlsConfig => {
  const frontendRegistrationConfirmationUrl =
    process.env.FRONTEND_REGISTRATION_CONFIRMATION_URL;
  if (!frontendRegistrationConfirmationUrl)
    throw new Error('FRONTEND_REGISTRATION_CONFIRMATION_URL is not defined');
  return {
    FRONTEND_REGISTRATION_CONFIRMATION_URL: frontendRegistrationConfirmationUrl,
  };
};
