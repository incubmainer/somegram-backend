import { SubscriptionType } from '../../../../../libs/common/enums/payments';

export const SUBSCRIPTION_TYPE = {
  day: SubscriptionType.DAY,
  week: SubscriptionType.WEEKLY,
  month: SubscriptionType.MONTHLY,
};

export enum SubscriptionStatuses {
  Active = 'Active',
  Canceled = 'Canceled',
  Suspended = 'Suspended',
  Pending = 'Pending',
}
