export class AuthConfig {
  public readonly restorePasswordCodeExpireAfterMiliseconds: number;
  public readonly restorePasswordCodeLength: number;
  public readonly recaptchaSecretKey: string;
  public readonly recaptchaSiteKey: string;
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
  const restorePasswordCodeLengthStr = process.env.RESTORE_PASSWORD_CODE_LENGTH;
  if (!restorePasswordCodeLengthStr) {
    throw new Error('RESTORE_PASSWORD_CODE_LENGTH is not defined');
  }
  const restorePasswordCodeLength = parseInt(restorePasswordCodeLengthStr);
  if (isNaN(restorePasswordCodeLength)) {
    throw new Error('RESTORE_PASSWORD_CODE_LENGTH is not a number');
  }
  const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!recaptchaSecretKey) {
    throw new Error('RECAPTCHA_SECRET_KEY is not defined');
  }
  const recaptchaSiteKey = process.env.RECAPTCHA_SITE_KEY;
  if (!recaptchaSiteKey) {
    throw new Error('RECAPTCHA_SITE_KEY is not defined');
  }
  return {
    restorePasswordCodeExpireAfterMiliseconds,
    restorePasswordCodeLength,
    recaptchaSecretKey,
    recaptchaSiteKey,
  };
};
