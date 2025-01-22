import Stripe from 'stripe';
import { AppNotificationResultType } from '@app/application-notification';

export interface IStripeEventHandler {
  handle(event: Stripe.Event): Promise<AppNotificationResultType<null>>;
}
