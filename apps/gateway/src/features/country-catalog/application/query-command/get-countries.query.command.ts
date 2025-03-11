import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  CountryOutputDto,
  CountryOutputDtoMapper,
} from '../../api/dto/output-dto/country-catalog.output-dto';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  PrismaClient as GatewayPrismaClient,
  CountryCatalog,
} from '@prisma/gateway';
import { LoggerService } from '@app/logger';

export class GetCountriesQueryCommand {
  constructor() {}
}

@QueryHandler(GetCountriesQueryCommand)
export class GetCountriesQueryCommandHandler
  implements IQueryHandler<GetCountriesQueryCommand, CountryOutputDto[]>
{
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly countryOutputDtoMapper: CountryOutputDtoMapper,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetCountriesQueryCommandHandler.name);
  }

  async execute(query: GetCountriesQueryCommand): Promise<CountryOutputDto[]> {
    this.logger.debug('Execute: get countries command', this.execute.name);
    const countries: CountryCatalog[] | [] =
      await this.txHost.tx.countryCatalog.findMany({});

    return this.countryOutputDtoMapper.mapCountries(countries);
  }
}
