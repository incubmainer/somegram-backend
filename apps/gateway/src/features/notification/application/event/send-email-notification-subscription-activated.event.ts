import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { DateFormatter } from '../../../../common/utils/date-formatter.util';
import { EmailAdapter } from '../../infrastructure/email.adapter';

export class SendEmailNotificationSubscriptionActivatedEvent {
  constructor(
    public email: string,
    public expiredAt: Date,
  ) {}
}

@EventsHandler(SendEmailNotificationSubscriptionActivatedEvent)
export class SendEmailNotificationSubscriptionActivatedEventHandler
  implements IEventHandler<SendEmailNotificationSubscriptionActivatedEvent>
{
  private readonly subject: string = 'Your subscription is activated';
  private readonly template: string = 'activated-subscription.html';
  constructor(
    private readonly logger: LoggerService,
    private readonly dateFormatter: DateFormatter,
    private readonly emailAdapter: EmailAdapter,
  ) {
    this.logger.setContext(
      SendEmailNotificationSubscriptionActivatedEventHandler.name,
    );
  }
  async handle(
    command: SendEmailNotificationSubscriptionActivatedEvent,
  ): Promise<void> {
    this.logger.debug(
      'Execute: send email notification - subscription activated',
      this.handle.name,
    );
    const { email, expiredAt } = command;
    try {
      const date = this.dateFormatter.toDDMMYYYY(expiredAt);

      await this.emailAdapter.sendSubscriptionNotification(
        email,
        this.subject,
        this.template,
        date,
      );
    } catch (e) {
      this.logger.error(e, this.handle.name);
    }
  }
}
