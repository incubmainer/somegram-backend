import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { PrismaModule } from '../prisma-service/prisma.module';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaService } from '../prisma-service/prisma.service';

export const clsModule = ClsModule.forRoot({
  plugins: [
    new ClsPluginTransactional({
      imports: [PrismaModule],
      adapter: new TransactionalAdapterPrisma({
        prismaInjectionToken: PrismaService,
      }),
    }),
  ],
});
