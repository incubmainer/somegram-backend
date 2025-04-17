import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { HELLO_MESSENGER } from '../constants/service.constants';
import { ApplicationNotification } from '@app/application-notification';
import { LoggerService } from '@app/logger';

@Injectable()
export class MessengerServiceAdapter {
  constructor(
    @Inject('MESSENGER_SERVICE')
    private readonly messengerServiceClient: ClientProxy,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
  ) {}

  async hello() {
    try {
      const responseOfService = this.messengerServiceClient
        .send({ cmd: HELLO_MESSENGER }, {})
        .pipe(timeout(20000));
      return await firstValueFrom(responseOfService);
    } catch (e) {
      this.logger.error(e, this.hello.name);
      return this.appNotification.internalServerError();
    }
  }
}
