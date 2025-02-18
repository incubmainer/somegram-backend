import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

export class RegisteredUserEvent {
  constructor() {}
}

@EventsHandler(RegisteredUserEvent)
export class RegisteredUserEventHandler
  implements IEventHandler<RegisteredUserEvent>
{
  async handle(event: RegisteredUserEvent): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
