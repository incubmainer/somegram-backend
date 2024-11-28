import { Module } from '@nestjs/common';
import { CountryCatalogController } from './api/country-catalog.controller';
import {
  CityOutputDtoMapper,
  CountryOutputDtoMapper,
} from './api/dto/output-dto/country-catalog.output-dto';

@Module({
  imports: [],
  controllers: [CountryCatalogController],
  providers: [CountryOutputDtoMapper, CityOutputDtoMapper],
})
export class CountryCatalogModule {}
