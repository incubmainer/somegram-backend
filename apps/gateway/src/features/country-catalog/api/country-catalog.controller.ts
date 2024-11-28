import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CountriesInfoSwagger } from './swagger/get-countries';
import { CitiesInfoSwagger } from './swagger/get-city';
import {
  CityCatalogQueryDto,
  CountryCatalogQueryDto,
} from './dto/input-dto/country-catalog.input-dto';

/*
 Нужна ли авторизация для получения каталогов стран?
 Есть ли какой нибдуь токен для внутрених запросов от фронта?
 Внедрение паггинатора как зависимость query command?
 Внедрение query factory как зависимость?
 Создание query factory как класс?
 */
@ApiTags('Country catalog')
@Controller('country-catalog')
export class CountryCatalogController {
  constructor() {}

  @Get('country')
  @CountriesInfoSwagger()
  async getCountries(@Query() query: CountryCatalogQueryDto) {}

  @Get('city')
  @CitiesInfoSwagger()
  async getCities(@Query() query: CityCatalogQueryDto) {}
}
