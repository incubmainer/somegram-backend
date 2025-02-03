import { Controller, Post } from '@nestjs/common';
import { LoggerService } from '@app/logger';

@Controller()
export class NotificationController {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(NotificationController.name);
  }

  @Post()
  async test() {}

  // @MessagePattern({ cmd: CREATE_NOTIFICATION })
  // async createNotification(): Promise<void> {
  //   this.logger.debug(
  //     'Execute: create notification',
  //     this.createNotification.name,
  //   );
  // }
}
