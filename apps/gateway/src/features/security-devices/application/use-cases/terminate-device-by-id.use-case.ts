import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class TerminateDeviceByIdCommand {
  constructor() {}
}

@CommandHandler(TerminateDeviceByIdCommand)
export class TerminateDeviceByIdCommandHandler
  implements ICommandHandler<TerminateDeviceByIdCommand, void>
{
  constructor() {}

  async execute(command: TerminateDeviceByIdCommand): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
