import { Controller } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { AppNotificationResultType } from '@app/application-notification';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';
import {
  GET_CHAT_MESSAGES,
  READ_MESSAGE,
  SEND_MESSAGE_TO_CHAT,
} from '../../../../../gateway/src/common/constants/service.constants';
import { SendMessageCommand } from '../application/use-case/send-message.use-case';
import { SendMessageInputDto } from './dto/input-dto/send-message.input.dto';
import { GetChatMessagesQuery } from '../application/query-bus/get-chat-messages.use-case';
import { GetChatMessagesInputDto } from './dto/input-dto/get-chat-messages.input.dto';
import { Pagination } from '@app/paginator';
import { GetChatMessagesOutputDto } from './dto/output-dto/get-chat-messages.output.dto';
import { ReadMessageCommand } from '../application/use-case/read-message.use-case';
import { ReadMessageInputDto } from './dto/input-dto/read-message.input.dto';
import { SendMessageOutputDto } from './dto/output-dto/send-message.output.dto';

@Controller()
export class MessageController {
  constructor(
    private readonly logger: LoggerService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    this.logger.setContext(MessageController.name);
  }

  @MessagePattern({ cmd: SEND_MESSAGE_TO_CHAT })
  async sendMessage(
    body: SendMessageInputDto,
  ): Promise<AppNotificationResultType<SendMessageOutputDto>> {
    this.logger.debug('Execute: send message', this.sendMessage.name);

    const result: AppNotificationResultType<SendMessageOutputDto> =
      await this.commandBus.execute(new SendMessageCommand(body));

    this.logger.debug(result.appResult, this.sendMessage.name);

    return result;
  }

  @MessagePattern({ cmd: GET_CHAT_MESSAGES })
  async getChatMessages(
    body: GetChatMessagesInputDto,
  ): Promise<
    AppNotificationResultType<Pagination<GetChatMessagesOutputDto[]>>
  > {
    this.logger.debug('Execute: get chat messages', this.getChatMessages.name);

    const result: AppNotificationResultType<
      Pagination<GetChatMessagesOutputDto[]>
    > = await this.queryBus.execute(new GetChatMessagesQuery(body));

    this.logger.debug(result.appResult, this.getChatMessages.name);

    return result;
  }

  @MessagePattern({ cmd: READ_MESSAGE })
  async readMessage(
    body: ReadMessageInputDto,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug('Execute: read message', this.readMessage.name);

    const result: AppNotificationResultType<null> =
      await this.commandBus.execute(new ReadMessageCommand(body));

    this.logger.debug(result.appResult, this.readMessage.name);

    return result;
  }
}
