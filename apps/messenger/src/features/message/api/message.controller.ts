import { Controller } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { AppNotificationResultType } from '@app/application-notification';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';
import { SEND_MESSAGE_TO_CHAT } from '../../../../../gateway/src/common/constants/service.constants';
import { SendMessageCommand } from '../application/use-case/send-message.use-case';
import { SendMessageInputDto } from './dto/input-dto/send-message.input.dto';

@Controller()
export class MessageController {
  constructor(
    private readonly logger: LoggerService,
    private readonly commandBus: CommandBus,
  ) {
    this.logger.setContext(MessageController.name);
  }

  @MessagePattern({ cmd: SEND_MESSAGE_TO_CHAT })
  async sendMessage(
    body: SendMessageInputDto,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug('Execute: send message', this.sendMessage.name);

    const result: AppNotificationResultType<null> =
      await this.commandBus.execute(new SendMessageCommand(body));

    this.logger.debug(result.appResult, this.sendMessage.name);

    return result;
  }
}
