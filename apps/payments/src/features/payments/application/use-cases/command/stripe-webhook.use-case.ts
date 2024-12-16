import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

import { StripeEventAdapter } from '../../../../../common/adapters/stripe-event.adaper';

export class StripeWebhookCommand {
  constructor(
    public rawBody: Buffer,
    public signatureHeader: string,
  ) {}
}

@CommandHandler(StripeWebhookCommand)
export class StripeWebhookUseCase
  implements ICommandHandler<StripeWebhookCommand>
{
  signatureSecret = this.configService.get<string>('STRIPE_SIGNATURE_SECRET');
  constructor(
    private readonly stripeEventAdapter: StripeEventAdapter,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: StripeWebhookCommand) {
    const extractedRawBody = Buffer.from(command.rawBody);
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        extractedRawBody,
        command.signatureHeader,
        this.signatureSecret,
      );
      await this.stripeEventAdapter.handleEvent(event);

      return true;
    } catch (e) {
      console.error(e);
      throw new BadRequestException(`Webhook Error: ${e.message}`);
    }
  }
}
