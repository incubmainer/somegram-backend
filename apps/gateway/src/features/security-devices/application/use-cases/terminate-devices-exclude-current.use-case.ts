import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class TerminateDevicesExcludeCurrentCommand {
  constructor() {}
}

@CommandHandler(TerminateDevicesExcludeCurrentCommand)
export class TerminateDevicesExcludeCurrentCommandHandler
  implements ICommandHandler<TerminateDevicesExcludeCurrentCommand, void>
{
  constructor() {}

  async execute(command: TerminateDevicesExcludeCurrentCommand): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
