import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CountryCatalogEntity } from '../../domain/country-catalog.entity';
import { CountryCityRepository } from '../../infrastructure/country-city.repository';
import {
  PullCountryWithCityResponseType,
  PullCountryWithCityType,
} from '../../domain/type/type';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

export class UpdateOrCreateOrCreateCatalogCommand {
  constructor() {}
}

@CommandHandler(UpdateOrCreateOrCreateCatalogCommand)
export class UpdateOrCreateCatalogCommandHandler
  implements
    ICommandHandler<
      UpdateOrCreateOrCreateCatalogCommand,
      AppNotificationResultType<void>
    >
{
  private readonly COUNTRY_API_URI: string;
  private readonly COUNTRY_API_METHOD: string;
  constructor(
    @Inject(CountryCatalogEntity.name)
    private readonly countryCatalogEntity: typeof CountryCatalogEntity,
    private readonly countryCityRepository: CountryCityRepository,
    private readonly applicationNotification: ApplicationNotification,
  ) {
    this.COUNTRY_API_URI = 'https://countriesnow.space/api/v0.1/countries/';
    this.COUNTRY_API_METHOD = 'GET';
  }
  async execute(
    command: UpdateOrCreateOrCreateCatalogCommand,
  ): Promise<AppNotificationResultType<void>> {
    const countriesArr: CountryCatalogEntity[] = [];

    const data: PullCountryWithCityResponseType | null = await this.pullData();

    if (!data) return this.applicationNotification.notFound();

    data.data.forEach((country: PullCountryWithCityType): void => {
      const newCountry: CountryCatalogEntity = this.countryCatalogEntity.create(
        country.country,
        country.iso2,
        country.cities,
      );
      countriesArr.push(newCountry);
    });

    const result: boolean =
      await this.countryCityRepository.saveMany(countriesArr);
    if (!result) return this.applicationNotification.internalServerError();

    return this.applicationNotification.success(null);
  }

  private async pullData(): Promise<PullCountryWithCityResponseType | null> {
    try {
      const response = await fetch(this.COUNTRY_API_URI, {
        method: this.COUNTRY_API_METHOD,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (e) {
      return null;
    }
  }
}
