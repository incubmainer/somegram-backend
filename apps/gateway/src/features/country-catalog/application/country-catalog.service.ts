import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateOrCreateOrCreateCatalogCommand } from './use-cases/update-or-create-catalog';
import { LoggerService } from '@app/logger';

@Injectable()
export class CountryCatalogService implements OnApplicationBootstrap {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(CountryCatalogService.name);
  }

  onApplicationBootstrap() {
    this.logger.debug(
      'Execute: on application bootstrap, update country catalog',
      this.onApplicationBootstrap.name,
    );
    this.commandBus.execute(new UpdateOrCreateOrCreateCatalogCommand());
  }
}
