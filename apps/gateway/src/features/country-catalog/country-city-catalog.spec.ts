import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  UpdateOrCreateCatalogCommandHandler,
  UpdateOrCreateOrCreateCatalogCommand,
} from './application/use-cases/update-or-create-catalog';
import { ConfigModule } from '@nestjs/config';
import { loadEnvFileNames } from '../../common/config/load-env-file-names';
import { finalConfig } from '../../common/config/config';
import { ClsTransactionalModule } from '../../common/modules/cls-transactional.module';
import {
  ApplicationNotificationModule,
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { CountryCatalogModule } from './country-catalog.module';
import {
  GetCountriesQueryCommand,
  GetCountriesQueryCommandHandler,
} from './application/query-command/get-countries.query.command';
import {
  GetCitiesByCountryIdQueryCommand,
  GetCitiesByCountryIdQueryCommandHandler,
} from './application/query-command/get-cities-by-country-id.query.command';
import {
  CityOutputDto,
  CountryOutputDto,
} from './api/dto/output-dto/country-catalog.output-dto';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { CommandExecutorService } from '../../common/services/command-executor-service';
import { CountryCityRepository } from './infrastructure/country-city.repository';
import { PullCountryWithCityResponseType } from './domain/type/type';

class CommandExecutorServiceMock implements OnApplicationBootstrap {
  constructor(private readonly commandBus: CommandBus) {}
  onApplicationBootstrap() {}
}

export const testData: PullCountryWithCityResponseType = {
  error: false,
  msg: 'Data retrieved successfully',
  data: [
    {
      iso2: 'US',
      iso3: 'USA',
      country: 'United States',
      cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
    },
    {
      iso2: 'CA',
      iso3: 'CAN',
      country: 'Canada',
      cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'],
    },
    {
      iso2: 'GB',
      iso3: 'GBR',
      country: 'United Kingdom',
      cities: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds'],
    },
    {
      iso2: 'AU',
      iso3: 'AUS',
      country: 'Australia',
      cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
    },
    {
      iso2: 'IN',
      iso3: 'IND',
      country: 'India',
      cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'],
    },
  ],
};

describe('CountryCityCatalog', () => {
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let txHost: TransactionHost<TransactionalAdapterPrisma<GatewayPrismaClient>>;
  let updateOrCreateCatalogHandler: UpdateOrCreateCatalogCommandHandler;
  let countryCityRepository: CountryCityRepository;
  beforeAll(async () => {
    /*
    Просто зарегестрировать GatewayModule не получается, сыпяться ошибки
    из-за notification (НЕ Application-Notification)
    */
    const moduleBuilder: TestingModuleBuilder = Test.createTestingModule({
      imports: [
        ApplicationNotificationModule,
        CountryCatalogModule,
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: false,
          envFilePath: loadEnvFileNames(),
          load: [finalConfig],
        }),
        ClsTransactionalModule,
      ],
    });

    moduleBuilder
      .overrideProvider(CommandExecutorService)
      .useClass(CommandExecutorServiceMock);

    const module: TestingModule = await moduleBuilder.compile();

    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
    txHost = module.get<TransactionHost>(TransactionHost);
    countryCityRepository = module.get<CountryCityRepository>(
      CountryCityRepository,
    );
    /*
     Без регистрации обработчика не находит команду
    */
    commandBus.register([UpdateOrCreateCatalogCommandHandler]);
    queryBus.register([
      GetCountriesQueryCommandHandler,
      GetCitiesByCountryIdQueryCommandHandler,
    ]);

    updateOrCreateCatalogHandler =
      module.get<UpdateOrCreateCatalogCommandHandler>(
        UpdateOrCreateCatalogCommandHandler,
      );
  });

  beforeEach(async () => {
    await clearTable();
  });

  const clearTable = async (): Promise<void> => {
    await txHost.tx.cityCatalog.deleteMany();
    await txHost.tx.countryCatalog.deleteMany();
  };

  it('should create countries and cities, then get them', async () => {
    const spy = jest
      .spyOn<any, any>(updateOrCreateCatalogHandler, 'pullData')
      .mockImplementation(() => {
        return Promise.resolve(testData);
      });

    const result: AppNotificationResultType<void> = await commandBus.execute(
      new UpdateOrCreateOrCreateCatalogCommand(),
    );

    expect(result.appResult).toEqual(AppNotificationResultEnum.Success);

    const getCountry: CountryOutputDto[] = await queryBus.execute(
      new GetCountriesQueryCommand(),
    );
    expect(getCountry).toBeDefined();

    const countryId = getCountry[0].id;

    const getCitiesByCountryId: CityOutputDto[] = await queryBus.execute(
      new GetCitiesByCountryIdQueryCommand(countryId),
    );
    expect(getCitiesByCountryId).toBeDefined();
    spy.mockRestore();
  });

  it('should not get city by id', async () => {
    await expect(
      queryBus.execute(new GetCitiesByCountryIdQueryCommand('1')),
    ).rejects.toThrow(NotFoundException);
  });

  it('should get empty country array', async () => {
    const getCountry: CountryOutputDto[] = await queryBus.execute(
      new GetCountriesQueryCommand(),
    );
    expect(getCountry).toHaveLength(0);
  });

  it('should not create countries and cities, pull error', async () => {
    const spy = jest
      .spyOn<any, any>(updateOrCreateCatalogHandler, 'pullData')
      .mockImplementation(() => {
        return Promise.resolve(null);
      });

    const result: AppNotificationResultType<void> = await commandBus.execute(
      new UpdateOrCreateOrCreateCatalogCommand(),
    );

    expect(result.appResult).toEqual(AppNotificationResultEnum.NotFound);

    spy.mockRestore();
  });

  it('should not create countries and cities, repository error', async () => {
    const spyPull = jest
      .spyOn<any, any>(updateOrCreateCatalogHandler, 'pullData')
      .mockImplementation(() => {
        return Promise.resolve(testData);
      });
    const spy = jest
      .spyOn<any, any>(countryCityRepository, 'saveMany')
      .mockResolvedValue(false);

    const result: AppNotificationResultType<void> = await commandBus.execute(
      new UpdateOrCreateOrCreateCatalogCommand(),
    );

    expect(result.appResult).toEqual(AppNotificationResultEnum.InternalError);

    spy.mockRestore();
    spyPull.mockRestore();
  });
});
