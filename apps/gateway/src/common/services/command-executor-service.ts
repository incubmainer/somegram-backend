import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateOrCreateOrCreateCatalogCommand } from '../../features/country-catalog/application/use-cases/update-or-create-catalog';

@Injectable()
export class CommandExecutorService implements OnApplicationBootstrap {
  constructor(private readonly commandBus: CommandBus) {}

  async onApplicationBootstrap() {
    await this.commandBus.execute(new UpdateOrCreateOrCreateCatalogCommand());
  }
}
