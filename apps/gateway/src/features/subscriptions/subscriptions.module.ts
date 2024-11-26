import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ClsTransactionalModule } from '../../common/modules/cls-transactional.module';
import { SubscriptionsController } from './api/subscriptions.controller';
import { CreatePaymentUseCase } from './application/use-cases/create-payments.use-case';
import { UsersQueryRepository } from '../users/infrastructure/users.query-repository';
import { PaymentsServiceAdapter } from '../../common/adapter/payment-service.adapter';
import { ClientsModule } from '@nestjs/microservices';
import { paymentsServiceOptions } from '../../common/config/module-options/get-pyments-service.options';

const useCases = [CreatePaymentUseCase];

const repositories = [UsersQueryRepository];

const services = [PaymentsServiceAdapter];
@Module({
  imports: [
    ClientsModule.registerAsync([paymentsServiceOptions()]),
    CqrsModule,
    ClsTransactionalModule,
  ],
  controllers: [SubscriptionsController],
  providers: [...services, ...useCases, ...repositories],
  exports: [],
})
export class SubscriptionsModule {}