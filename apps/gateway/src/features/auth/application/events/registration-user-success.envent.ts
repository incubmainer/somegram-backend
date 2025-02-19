import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

export class RegistrationUserSuccessEvent {
  constructor(public email: string) {}
}

@EventsHandler(RegistrationUserSuccessEvent)
export class RegistrationUserSuccessEventHandler
  implements IEventHandler<RegistrationUserSuccessEvent>
{
  async handle(event: RegistrationUserSuccessEvent): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
