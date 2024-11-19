import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { CREATE_PAYMENT } from '../config/constants/service.constants';

@Injectable()
export class PhotoServiceAdapter {
  constructor(
    @Inject('PAYMENTS_SERVICE')
    private readonly paymentsServiceClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  async createSubscription(payload: { userId: string; subInfo: any }) {
    try {
      const responseOfService = this.paymentsServiceClient
        .send({ cmd: CREATE_PAYMENT }, { payload })
        .pipe(timeout(10000));

      const result = await firstValueFrom(responseOfService);
      return result;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
