import { ApiProperty } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { CountryAvailableLanguageEnum } from '../../../domain/enum/country-catalog.enum';

export class CountryOutputDto {
  @ApiProperty({
    description: 'Country`s id',
    example: '1',
    type: String,
  })
  id: string;
  @ApiProperty({
    description: 'Country string id',
    example: 'DE',
    type: String,
  })
  public countryCode: string;
  @ApiProperty({
    description: 'Country name',
    example: 'Germany',
    type: String,
  })
  public name: string;
}

export class CityOutputDto {
  @ApiProperty({
    description: 'City`s id',
    example: '1',
    type: String,
  })
  public id: string;
  @ApiProperty({
    description: 'Country`s id',
    example: '1',
    type: String,
  })
  countryId: string;
  @ApiProperty({
    description: 'City name',
    example: 'Vilnius',
    type: String,
  })
  public name: string;
}

@Injectable()
export class CountryOutputDtoMapper {
  /*
   TODO:
   1. Сделать типизацию
   2. Сделать обработку языка
   */
  mapCountries(
    countries: any[],
    language: CountryAvailableLanguageEnum,
  ): CountryOutputDto[] {
    return countries.map((country: any): CountryOutputDto => {
      return {
        id: country.id.toString(),
        countryCode: country.countryCode,
        name: '',
      };
    });
  }
}

@Injectable()
export class CityOutputDtoMapper {
  /*
   TODO:
   1. Сделать типизацию
   2. Сделать обработку языка
   */
  mapCities(
    cities: any[],
    language: CountryAvailableLanguageEnum,
  ): CityOutputDto[] {
    return cities.map((city: any): CityOutputDto => {
      return {
        id: city.id.toString(),
        countryId: city.countryId.toString(),
        name: '',
      };
    });
  }
}
