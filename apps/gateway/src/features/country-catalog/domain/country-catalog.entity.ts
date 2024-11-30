import { CountryCatalog, CityCatalog } from '@prisma/gateway';
import { CityCatalogEntity } from './city-catalog.entity';

export class CountryCatalogEntity implements CountryCatalog {
  public id: number;
  public code: string;
  public name: string;
  public CityCatalog: CityCatalog[];

  static create(
    name: string,
    code: string,
    cities: string[],
  ): CountryCatalogEntity {
    const country = new this();
    country.code = code;
    country.name = name;
    country.CityCatalog = [];

    const uniqCities = new Set(cities);
    uniqCities.forEach((city: string) => {
      const newCity = CityCatalogEntity.create(city);
      country.CityCatalog.push(newCity);
    });

    return country;
  }
}
