import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserRegisteredEvent } from '../../domain/events/user-registered.events';
import { EmailServiceI } from '../../domain/email.service';

@EventsHandler(UserRegisteredEvent)
export class UserRegisteredEventHandler
  implements IEventHandler<UserRegisteredEvent> {
  constructor(private emailService: EmailServiceI) { }

  handle(event: UserRegisteredEvent) {
    this.emailService.sendToEmailConfirmationLink(
      event.email,
      event.confirmationToken,
    );
  }
}
