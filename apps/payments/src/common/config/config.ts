import { paymentsDbConfig, PaymentsDbConfig } from './payments-db.config';

class PaymentsConfig {
  readonly db: PaymentsDbConfig;
}

export const paymentsConfig = (): PaymentsConfig => {
  return {
    db: paymentsDbConfig(),
  };
};
