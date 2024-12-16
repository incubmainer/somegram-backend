import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  MyPaymentsOutputDto,
  myPaymentsMapper,
} from '../../../api/dto/output-dto/payments.output-dto';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

export class GetPaymentsQuery {
  constructor(public userId: string) {}
}

@QueryHandler(GetPaymentsQuery)
export class GetPaymentsQueryUseCase
  implements IQueryHandler<GetPaymentsQuery>
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly appNotification: ApplicationNotification,
  ) {}

  async execute(
    command: GetPaymentsQuery,
  ): Promise<AppNotificationResultType<MyPaymentsOutputDto[]>> {
    try {
      const payments = await this.paymentsRepository.getPaymentsByUserId(
        command.userId,
      );
      const mapPayments: MyPaymentsOutputDto[] = myPaymentsMapper(payments);

      return this.appNotification.success(mapPayments);
    } catch (e) {
      console.error(e);
      return this.appNotification.internalServerError();
    }
  }
}
