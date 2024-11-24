import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PaymentsRepository } from '../../infrastructure/payments.repository';
import stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

export class SripeWebhookCommand {
  constructor(
    public rawBody: Buffer,
    public signatureHeader: string,
  ) {}
}

@CommandHandler(SripeWebhookCommand)
export class SripeWebhookUseCase
  implements ICommandHandler<SripeWebhookCommand>
{
  configService = new ConfigService();
  signatureSecret = this.configService.get<string>('STRIPE_SIGNATURE_SECRET');
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async execute(command: SripeWebhookCommand) {
    const extractedRawBody = Buffer.from(command.rawBody);
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        extractedRawBody,
        command.signatureHeader,
        this.signatureSecret,
      );
      if (event.type === 'checkout.session.completed') {
        console.log(event);
      }
      return true;
    } catch (err) {
      console.error(err);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
  }
}
