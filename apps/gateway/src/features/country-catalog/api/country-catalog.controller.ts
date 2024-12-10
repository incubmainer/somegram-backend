import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CountriesInfoSwagger } from './swagger/get-countries';
import { CitiesInfoSwagger } from './swagger/get-city';
import {
  CityOutputDto,
  CountryOutputDto,
} from './dto/output-dto/country-catalog.output-dto';
import { QueryBus } from '@nestjs/cqrs';
import { GetCountriesQueryCommand } from '../application/query-command/get-countries.query.command';
import { GetCitiesByCountryIdQueryCommand } from '../application/query-command/get-cities-by-country-id.query.command';
import { COUNTRY_CATALOG_ROUTE } from '../../../common/constants/route.constants';

@ApiTags('Country catalog')
@Controller(COUNTRY_CATALOG_ROUTE.MAIN)
export class CountryCatalogController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(COUNTRY_CATALOG_ROUTE.COUNTRY)
  @CountriesInfoSwagger()
  async getCountries(): Promise<CountryOutputDto[]> {
    return await this.queryBus.execute(new GetCountriesQueryCommand());
  }

  @Get(`:countryId/${COUNTRY_CATALOG_ROUTE.CITY}`)
  @CitiesInfoSwagger()
  async getCities(
    @Param('countryId') countryId: string,
  ): Promise<CityOutputDto[]> {
    return await this.queryBus.execute(
      new GetCitiesByCountryIdQueryCommand(countryId),
    );
  }
}
