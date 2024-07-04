import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { PrismaClient } from '@prisma/gateway';
import { ConfigModule } from '@nestjs/config';
import { loadEnvFileNames } from './common/config/load-env-file-names';
import { finalConfig } from './common/config/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
      envFilePath: loadEnvFileNames(),
      load: [finalConfig],
    }),
  ],
  controllers: [GatewayController],
  providers: [GatewayService, PrismaClient],
})
export class GatewayModule { }
