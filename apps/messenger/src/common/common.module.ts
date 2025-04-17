import { Global, Module } from '@nestjs/common';
import { clsModule } from './modules/cls/cls.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { CqrsModule } from '@nestjs/cqrs';

const exportProviders = [PrismaModule, CqrsModule];

@Global()
@Module({
  imports: [clsModule, PrismaModule, CqrsModule],
  controllers: [],
  providers: [],
  exports: [...exportProviders],
})
export class CommonModule {}
