import { Module } from '@nestjs/common';
import { CountryCatalogController } from './api/country-catalog.controller';
import {
  CityOutputDtoMapper,
  CountryOutputDtoMapper,
} from './api/dto/output-dto/country-catalog.output-dto';
import { UpdateOrCreateCatalogCommandHandler } from './application/use-cases/update-or-create-catalog';
import { CityCatalogEntity } from './domain/city-catalog.entity';
import { CountryCityRepository } from './infrastructure/country-city.repository';
import { CountryCatalogEntity } from './domain/country-catalog.entity';
import { GetCountriesQueryCommandHandler } from './application/query-command/get-countries.query.command';
import { GetCitiesByCountryIdQueryCommandHandler } from './application/query-command/get-cities-by-country-id.query.command';

const cityCatalogEntityProvider = {
  provide: 'CityCatalogEntity',
  useValue: CityCatalogEntity,
};

const countryCatalogEntityProvider = {
  provide: 'CountryCatalogEntity',
  useValue: CountryCatalogEntity,
};

@Module({
  imports: [],
  controllers: [CountryCatalogController],
  providers: [
    CountryOutputDtoMapper,
    CityOutputDtoMapper,
    UpdateOrCreateCatalogCommandHandler,
    cityCatalogEntityProvider,
    countryCatalogEntityProvider,
    CountryCityRepository,
    GetCountriesQueryCommandHandler,
    GetCitiesByCountryIdQueryCommandHandler,
  ],
})
export class CountryCatalogModule {}
