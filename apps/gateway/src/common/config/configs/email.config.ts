export class EmailConfig {
  readonly service: string;
  readonly user: string;
  readonly password: string;
}

export const emailConfig = (): EmailConfig => {
  const service = process.env.EMAIL_SERVICE;
  if (!service) throw new Error('EMAIL_SERVICE is not defined');
  const user = process.env.EMAIL_USER;
  if (!user) throw new Error('EMAIL_USER is not defined');
  const password = process.env.EMAIL_PASSWORD;
  if (!password) throw new Error('EMAIL_PASSWORD is not defined');
  return {
    service,
    user,
    password,
  };
};
