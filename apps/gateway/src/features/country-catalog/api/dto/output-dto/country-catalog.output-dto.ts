import { ApiProperty } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { CountryCatalog, CityCatalog } from '@prisma/gateway';

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
  mapCountries(countries: CountryCatalog[]): CountryOutputDto[] {
    return countries.map((country: CountryCatalog): CountryOutputDto => {
      return {
        id: country.id.toString(),
        countryCode: country.code,
        name: country.name,
      };
    });
  }
}

@Injectable()
export class CityOutputDtoMapper {
  mapCities(cities: CityCatalog[]): CityOutputDto[] {
    return cities.map((city: CityCatalog): CityOutputDto => {
      return {
        id: city.id.toString(),
        countryId: city.countryId.toString(),
        name: city.name,
      };
    });
  }
}
