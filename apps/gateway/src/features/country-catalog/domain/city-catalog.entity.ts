import { CountryCatalog, CityCatalog } from '@prisma/gateway';

export class CityCatalogEntity implements CityCatalog {
  public id: number;
  public name: string;
  public countryId: number;
  public CountryCatalog: CountryCatalog;

  static create(name: string): CityCatalogEntity {
    const city = new this();
    city.name = name;
    return city;
  }
}
