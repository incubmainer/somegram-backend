import { Injectable } from '@nestjs/common';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CountryCatalogEntity } from '../domain/country-catalog.entity';
import { CityCatalogEntity } from '../domain/city-catalog.entity';

@Injectable()
export class CountryCityRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
  ) {}

  async saveMany(countries: CountryCatalogEntity[]): Promise<boolean> {
    try {
      await this.txHost.withTransaction(async (): Promise<void> => {
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
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
