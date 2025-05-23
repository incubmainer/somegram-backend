import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  CityOutputDto,
  CityOutputDtoMapper,
} from '../../api/dto/output-dto/country-catalog.output-dto';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  PrismaClient as GatewayPrismaClient,
  CityCatalog,
} from '@prisma/gateway';
import { NotFoundException } from '@nestjs/common';
import { LoggerService } from '@app/logger';

export class GetCitiesByCountryIdQueryCommand {
  constructor(public countryId: string) {}
}

@QueryHandler(GetCitiesByCountryIdQueryCommand)
export class GetCitiesByCountryIdQueryCommandHandler
  implements IQueryHandler<GetCitiesByCountryIdQueryCommand, CityOutputDto[]>
{
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly logger: LoggerService,
    private readonly cityOutputDtoMapper: CityOutputDtoMapper,
  ) {
    this.logger.setContext(GetCitiesByCountryIdQueryCommandHandler.name);
  }

  async execute(
    query: GetCitiesByCountryIdQueryCommand,
  ): Promise<CityOutputDto[]> {
    this.logger.debug(
      'Execute: get cities by country id command',
      this.execute.name,
    );
    const { countryId } = query;
    const cities: CityCatalog[] | [] =
      await this.txHost.tx.cityCatalog.findMany({
        where: { countryId: countryId },
      });

    if (cities.length === 0) throw new NotFoundException();
    return this.cityOutputDtoMapper.mapCities(cities);
  }
}
