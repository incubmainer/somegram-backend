import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { EmailAdapter } from '../../../notification/infrastructure/email.adapter';

export class RegisteredUserEvent {
  constructor(
    public email: string,
    public name: string,
    public expiredAt: Date,
    public code: string,
    public html: string,
  ) {}
}

@EventsHandler(RegisteredUserEvent)
export class RegisteredUserEventHandler
  implements IEventHandler<RegisteredUserEvent>
{
  private readonly subject: string = 'Confirm registration';
  constructor(
    private readonly logger: LoggerService,
    private readonly emailAdapter: EmailAdapter,
  ) {
    this.logger.setContext(RegisteredUserEventHandler.name);
  }
  async handle(command: RegisteredUserEvent): Promise<void> {
    this.logger.debug(
      'Execute: send email notification - user registration',
      this.handle.name,
    );
    const { email, html, name, code, expiredAt } = command;
    try {
      await this.emailAdapter.sendEmailWithHtmlPattern(
        email,
        this.subject,
        html
          .replaceAll('##name##', name)
          .replaceAll('##token##', code)
          .replaceAll('##expiredAt##', expiredAt.toISOString()),
      );
    } catch (e) {
      this.logger.error(e, this.handle.name);
    }
  }
}
