import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { EmailAdapter } from '../../../notification/infrastructure/email.adapter';

export class RegistrationUserSuccessEvent {
  constructor(public email: string) {}
}

@EventsHandler(RegistrationUserSuccessEvent)
export class RegistrationUserSuccessEventHandler
  implements IEventHandler<RegistrationUserSuccessEvent>
{
  private readonly subject: string = 'Confirm registration';
  private readonly template: string = 'registration-success.html';
  constructor(
    private readonly logger: LoggerService,
    private readonly emailAdapter: EmailAdapter,
  ) {
    this.logger.setContext(RegistrationUserSuccessEventHandler.name);
  }
  async handle(event: RegistrationUserSuccessEvent): Promise<void> {
    this.logger.debug(
      'Execute: send email notification - The user is successfully registered',
      this.handle.name,
    );
    const { email } = event;
    try {
      await this.emailAdapter.sendInfoEmail(email, this.subject, this.template);
    } catch (e) {
      this.logger.error(e, this.handle.name);
    }
  }
}
