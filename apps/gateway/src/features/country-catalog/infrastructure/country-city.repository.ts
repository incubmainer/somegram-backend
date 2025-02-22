import { Injectable } from '@nestjs/common';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CountryCatalogEntity } from '../domain/country-catalog.entity';
import { CityCatalogEntity } from '../domain/city-catalog.entity';
import { LoggerService } from '@app/logger';

const TRANSACTION_TIMEOUT = 50000; //necessary to wait add all sities and contries wihtout timeout error

@Injectable()
export class CountryCityRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(CountryCityRepository.name);
  }

  async saveMany(countries: CountryCatalogEntity[]): Promise<void> {
    this.logger.debug('Execute: save countries and cities', this.saveMany.name);
    await this.txHost.withTransaction(
      { timeout: TRANSACTION_TIMEOUT },
      async (): Promise<void> => {
        const promises = countries.map((country: CountryCatalogEntity) => {
          return this.txHost.tx.countryCatalog.upsert({
            where: { code: country.code },
            update: {},
            create: {
              code: country.code,
              name: country.name,
              CityCatalog: {
                createMany: {
                  data: country.CityCatalog.map((city: CityCatalogEntity) => ({
                    name: city.name,
                  })),
                },
              },
            },
          });
        });

        await Promise.all(promises);
      },
    );
  }
}
