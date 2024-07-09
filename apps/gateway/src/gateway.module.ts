import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ConfigModule } from '@nestjs/config';
import { loadEnvFileNames } from './common/config/load-env-file-names';
import { finalConfig } from './common/config/config';
import { GatewayPrismaModule } from '@app/databases/gateway/gateway-prisma.module';
import { ClsModule } from 'nestjs-cls';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { GatewayPrismaServiceToken } from '@app/databases/gateway/gateway-prisma.service';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { AuthModule } from './features/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
      envFilePath: loadEnvFileNames(),
      load: [finalConfig],
    }),
    ClsModule.forRoot({
      plugins: [
        new ClsPluginTransactional({
          imports: [GatewayPrismaModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: GatewayPrismaServiceToken,
          }),
        }),
      ],
    }),
    GatewayPrismaModule,
    AuthModule,
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule { }
