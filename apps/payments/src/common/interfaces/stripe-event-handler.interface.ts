import Stripe from 'stripe';

export interface IStripeEventHandler {
  handle(event: Stripe.Event): Promise<void>;
}
