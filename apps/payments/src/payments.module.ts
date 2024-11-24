import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { loadEnvFileNames } from './common/config/load-env-file-names';
import { paymentsConfig } from './common/config/config';
import { PaymentsController } from './features/payments/api/payments.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { ClsTransactionalModule } from './common/modules/cls-transactional.module';
import { CreatePaymentUseCase } from './features/payments/application/use-cases/create-payment.use-case';
import { PaymentManager } from './common/managers/payment.manager';
import { PaymentsRepository } from './features/payments/infrastructure/payments.repository';
import { StripeAdapter } from './common/adapters/stripe.adapter';
import { SripeWebhookUseCase } from './features/payments/application/use-cases/stripe-webhook.use-case';

const useCases = [CreatePaymentUseCase, SripeWebhookUseCase];

const repositories = [PaymentsRepository];

const services = [PaymentManager, StripeAdapter];

@Module({
  imports: [
    CqrsModule,
    ClsTransactionalModule,
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
      envFilePath: loadEnvFileNames(),
      load: [paymentsConfig],
    }),
  ],
  controllers: [PaymentsController],
  providers: [...useCases, ...repositories, ...services],
})
export class PaymentsModule {}
