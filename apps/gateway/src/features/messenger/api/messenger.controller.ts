import { Controller, Get } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { MessengerServiceAdapter } from '../../../common/adapter/messenger-service.adapter';

@Controller('messenger')
export class MessengerController {
  constructor(
    private readonly logger: LoggerService,
    private readonly messengerServiceAdapter: MessengerServiceAdapter,
  ) {
    this.logger.setContext(MessengerController.name);
  }

  @Get()
  async hello() {
    return this.messengerServiceAdapter.hello();
  }
}
