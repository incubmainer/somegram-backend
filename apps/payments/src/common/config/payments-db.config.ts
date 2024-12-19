export class PaymentsDbConfig {
  readonly paymentsDatabaseUrl: string;
}

export const paymentsDbConfig = (): PaymentsDbConfig => {
  const databaseUrl = process.env.PAYMENTS_DATABASE_URL;
  if (!databaseUrl) throw new Error('PAYMENTS_DATABASE_URL is not set');
  return {
    paymentsDatabaseUrl: databaseUrl,
  };
};
