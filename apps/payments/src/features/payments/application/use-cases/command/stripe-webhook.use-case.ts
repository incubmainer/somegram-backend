import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { StripeEventAdapter } from '../../../../../common/adapters/stripe-event.adaper';
import { ConfigurationType } from '../../../../../settings/configuration/configuration';
import { LoggerService } from '@app/logger';
import { EnvSettings } from '../../../../../settings/env/env.settings';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

export class StripeWebhookCommand {
  constructor(
    public rawBody: Buffer,
    public signatureHeader: string,
  ) {}
}

// TODO Forbidden?
@CommandHandler(StripeWebhookCommand)
export class StripeWebhookUseCase
  implements
    ICommandHandler<StripeWebhookCommand, AppNotificationResultType<null>>
{
  private readonly envSettings: EnvSettings;
  private readonly signatureSecret: string;
  constructor(
    private readonly stripeEventAdapter: StripeEventAdapter,
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(StripeWebhookUseCase.name);
    this.envSettings = this.configService.get('envSettings', { infer: true });
    this.signatureSecret = this.envSettings.STRIPE_SIGNATURE_SECRET;
  }

  async execute(
    command: StripeWebhookCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug('Execute: stripe webhook', this.execute.name);
    const extractedRawBody: Buffer = Buffer.from(command.rawBody);
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        extractedRawBody,
        command.signatureHeader,
        this.signatureSecret,
      );
      await this.stripeEventAdapter.handleEvent(event);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
