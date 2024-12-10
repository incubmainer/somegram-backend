import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { SEND_SUBSCRIPTION_INFO } from '../../../../gateway/src/common/config/constants/service.constants';
import { SubscriptionDto } from '../../../../../libs/common/enums/payments';

@Injectable()
export class GatewayServiceClientAdapter {
  constructor(
    @Inject('PAYMENTS_SERVICE_RMQ')
    private readonly gatewayServiceClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  //TODO наменование и архитектура? общие dto в libs?
  async sendSubscriptionInfo(payload: SubscriptionDto) {
    this.gatewayServiceClient.emit(
      { cmd: SEND_SUBSCRIPTION_INFO },
      { payload },
    );
  }
}
