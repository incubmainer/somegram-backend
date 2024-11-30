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

/*
 Нужна ли авторизация для получения каталогов стран?
 Есть ли какой нибдуь токен для внутрених запросов от фронта?
 Внедрение паггинатора как зависимость query command?
 Внедрение query factory как зависимость?
 Создание query factory как класс?
 */

/*
 TODO:
 Общий класс для обычного query и отнаследоваться от него?
 Добавить константы в либу для максимальной и минимальной длины ?
 Валидация для параметров ?
 Сделать либу с декораторами, сейчас нужно для Trim + EntityId
*/

@ApiTags('Country catalog')
@Controller('country-catalog')
export class CountryCatalogController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('country')
  @CountriesInfoSwagger()
  async getCountries(): Promise<CountryOutputDto[]> {
    return await this.queryBus.execute(new GetCountriesQueryCommand());
  }

  @Get(':countryId/city')
  @CitiesInfoSwagger()
  async getCities(
    @Param('countryId') countryId: string,
  ): Promise<CityOutputDto[]> {
    return await this.queryBus.execute(
      new GetCitiesByCountryIdQueryCommand(+countryId),
    );
  }
}
