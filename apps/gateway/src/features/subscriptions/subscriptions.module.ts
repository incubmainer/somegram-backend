import { Module } from '@nestjs/common';
import { SubscriptionsController } from './api/subscriptions.controller';
import { CreatePaymentUseCase } from './application/use-cases/create-payments.use-case';
import { UpdateSubscriptionInfoUseCase } from './application/use-cases/update-subscription-info.use-case';
import { UpdateSubscriptionsInfoUseCase } from './application/use-cases/update-subscriptions-info.use-case';
import { UsersModule } from '../users/users.module';

const useCases = [
  CreatePaymentUseCase,
  UpdateSubscriptionInfoUseCase,
  UpdateSubscriptionsInfoUseCase,
];

@Module({
  imports: [UsersModule],
  controllers: [SubscriptionsController],
  providers: [...useCases],
  exports: [],
})
export class SubscriptionsModule {}
