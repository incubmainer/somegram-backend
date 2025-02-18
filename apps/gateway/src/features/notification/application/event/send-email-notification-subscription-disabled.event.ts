import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { EmailAdapter } from '../../infrastructure/email.adapter';

export class SendEmailNotificationSubscriptionDisabledEvent {
  constructor(public email: string) {}
}

@EventsHandler(SendEmailNotificationSubscriptionDisabledEvent)
export class SendEmailNotificationSubscriptionDisabledEventHandler
  implements IEventHandler<SendEmailNotificationSubscriptionDisabledEvent>
{
  private readonly subject: string = 'Your subscription is disabled';
  private readonly template: string = 'disabled-subscription.html';
  constructor(
    private readonly logger: LoggerService,
    private readonly emailAdapter: EmailAdapter,
  ) {
    this.logger.setContext(
      SendEmailNotificationSubscriptionDisabledEventHandler.name,
    );
  }
  async handle(
    command: SendEmailNotificationSubscriptionDisabledEvent,
  ): Promise<void> {
    this.logger.debug(
      'Execute: send email notification - subscription disabled',
      this.handle.name,
    );
    const { email } = command;
    try {
      await this.emailAdapter.sendSubscriptionNotification(
        email,
        this.subject,
        this.template,
      );
    } catch (e) {
      this.logger.error(e, this.handle.name);
    }
  }
}
