import { MiddlewareConsumer, Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { PrismaClient } from '@prisma/gateway';
import { LoggerMiddleware } from './tmp.middleware';

@Module({
  imports: [],
  controllers: [GatewayController],
  providers: [GatewayService, PrismaClient],
})
export class GatewayModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // Использовать для всех маршрутов
  }
}
