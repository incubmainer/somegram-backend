export class AuthConfig {
  public readonly restorePasswordCodeExpireAfterMiliseconds: number;
  public readonly emailConfirmationTokenExpireAfterMiliseconds: number;
  public readonly recaptchaSecretKey: string;
  public readonly recaptchaSiteKey: string;
  public readonly frontendProvider: string;
}

export const authConfig = (): AuthConfig => {
  const restorePasswordCodeExpireAfterMilisecondsStr =
    process.env.RESTORE_PASSWORD_CODE_EXPIRE_AFTER_MILISECONDS;
  if (!restorePasswordCodeExpireAfterMilisecondsStr) {
    throw new Error(
      'RESTORE_PASSWORD_CODE_EXPIRE_AFTER_MILISECONDS is not defined',
    );
  }
  const restorePasswordCodeExpireAfterMiliseconds = parseInt(
    restorePasswordCodeExpireAfterMilisecondsStr,
  );
  if (isNaN(restorePasswordCodeExpireAfterMiliseconds)) {
    throw new Error(
      'RESTORE_PASSWORD_CODE_EXPIRE_AFTER_MILISECONDS is not a number',
    );
  }
  const emailConfirmationTokenExpireAfterMilisecondsStr =
    process.env.EMAIL_CONFIRMATION_TOKEN_EXPIRE_AFTER_MILISECONDS;
  if (!emailConfirmationTokenExpireAfterMilisecondsStr) {
    throw new Error(
      'EMAIL_CONFIRMATION_TOKEN_EXPIRE_AFTER_MILISECONDS is not defined',
    );
  }
  const emailConfirmationTokenExpireAfterMiliseconds = parseInt(
    emailConfirmationTokenExpireAfterMilisecondsStr,
  );
  if (isNaN(emailConfirmationTokenExpireAfterMiliseconds)) {
    throw new Error(
      'EMAIL_CONFIRMATION_TOKEN_EXPIRE_AFTER_MILISECONDS is not a number',
    );
  }
  const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!recaptchaSecretKey) {
    throw new Error('RECAPTCHA_SECRET_KEY is not defined');
  }
  const recaptchaSiteKey = process.env.RECAPTCHA_SITE_KEY;
  if (!recaptchaSiteKey) {
    throw new Error('RECAPTCHA_SITE_KEY is not defined');
  }
  const frontendProvider = process.env.FRONTED_PROVIDER;
  if (!frontendProvider) throw new Error('FRONTED_PROVIDER is not set');
  return {
    restorePasswordCodeExpireAfterMiliseconds,
    emailConfirmationTokenExpireAfterMiliseconds,
    recaptchaSecretKey,
    recaptchaSiteKey,
    frontendProvider,
  };
};
