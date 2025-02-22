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
import { LoggerService } from '@app/logger';

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
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UpdateOrCreateCatalogCommandHandler.name);
    this.COUNTRY_API_URI = 'https://countriesnow.space/api/v0.1/countries/';
    this.COUNTRY_API_METHOD = 'GET';
  }
  async execute(
    command: UpdateOrCreateOrCreateCatalogCommand,
  ): Promise<AppNotificationResultType<void>> {
    this.logger.debug(
      'Execute: update country catalog command',
      this.execute.name,
    );
    try {
      const countriesArr: CountryCatalogEntity[] = [];

      const data: PullCountryWithCityResponseType | null =
        await this.pullData();

      if (!data) return this.applicationNotification.notFound();

      data.data.forEach((country: PullCountryWithCityType): void => {
        const newCountry: CountryCatalogEntity =
          this.countryCatalogEntity.create(
            country.country,
            country.iso2,
            country.cities,
          );
        countriesArr.push(newCountry);
      });

      await this.countryCityRepository.saveMany(countriesArr);

      return this.applicationNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.applicationNotification.internalServerError();
    }
  }

  private async pullData(): Promise<PullCountryWithCityResponseType | null> {
    const response = await fetch(this.COUNTRY_API_URI, {
      method: this.COUNTRY_API_METHOD,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  }
}
