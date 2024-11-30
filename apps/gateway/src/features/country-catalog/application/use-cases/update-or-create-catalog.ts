import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CountryCatalogEntity } from '../../domain/country-catalog.entity';
import { CountryCityRepository } from '../../infrastructure/country-city.repository';
import {
  PullCountryWithCityResponseType,
  PullCountryWithCityType,
} from '../../domain/type/type';

export class UpdateOrCreateOrCreateCatalogCommand {
  constructor() {}
}

@CommandHandler(UpdateOrCreateOrCreateCatalogCommand)
export class UpdateOrCreateCatalogCommandHandler
  implements ICommandHandler<UpdateOrCreateOrCreateCatalogCommand, any>
{
  constructor(
    @Inject(CountryCatalogEntity.name)
    private readonly countryCatalogEntity: typeof CountryCatalogEntity,
    private readonly countryCityRepository: CountryCityRepository,
  ) {}
  async execute(command: UpdateOrCreateOrCreateCatalogCommand): Promise<any> {
    const countriesArr: CountryCatalogEntity[] = [];

    const data: PullCountryWithCityResponseType | null = await this.pullData();

    if (!data) return;

    data.data.forEach((country: PullCountryWithCityType) => {
      const newCountry: CountryCatalogEntity = this.countryCatalogEntity.create(
        country.country,
        country.iso2,
        country.cities,
      );
      countriesArr.push(newCountry);
    });

    await this.countryCityRepository.saveMany(countriesArr);
  }

  private async pullData(): Promise<PullCountryWithCityResponseType | null> {
    try {
      const API_URL = 'https://countriesnow.space/api/v0.1/countries/';

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
