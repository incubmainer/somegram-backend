import { Global, Module } from '@nestjs/common';
import { clsModule } from './modules/cls/cls.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { CqrsModule } from '@nestjs/cqrs';
import { ApplicationNotification } from '@app/application-notification';
import { PaginatorModule } from '@app/paginator';

const exportProviders = [PrismaModule, CqrsModule, PaginatorModule];

@Global()
@Module({
  imports: [clsModule, PrismaModule, CqrsModule, PaginatorModule],
  controllers: [],
  providers: [ApplicationNotification],
  exports: [...exportProviders, ApplicationNotification],
})
export class CommonModule {}
