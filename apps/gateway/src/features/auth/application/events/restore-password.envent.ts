import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { EmailAdapter } from '../../../notification/infrastructure/email.adapter';

export class RestorePasswordEvent {
  constructor(
    public email: string,
    public name: string,
    public code: string,
    public html: string,
  ) {}
}

@EventsHandler(RestorePasswordEvent)
export class RestorePasswordEventHandler
  implements IEventHandler<RestorePasswordEvent>
{
  private readonly subject: string = 'Restore password';
  constructor(
    private readonly logger: LoggerService,
    private readonly emailAdapter: EmailAdapter,
  ) {
    this.logger.setContext(RestorePasswordEventHandler.name);
  }
  async handle(command: RestorePasswordEvent): Promise<void> {
    this.logger.debug(
      'Execute: send email notification - user restore password',
      this.handle.name,
    );
    const { email, html, name, code } = command;
    try {
      await this.emailAdapter.sendEmailWithHtmlPattern(
        email,
        this.subject,
        html.replaceAll('##name##', name).replaceAll('##code##', code),
      );
    } catch (e) {
      this.logger.error(e, this.handle.name);
    }
  }
}
