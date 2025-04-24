import { Controller } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { AppNotificationResultType } from '@app/application-notification';
import { QueryBus } from '@nestjs/cqrs';
import { GetAllChatsForUserQuery } from '../application/query-bus/get-all-chats-for-for-user.use-case';
import { GetAllChatsInputDto } from './dto/input-dto/get-all-chats.input.dto';
import {
  GET_CHAT,
  GET_USERS_CHATS_MESSENGER,
} from '../../../../../gateway/src/common/constants/service.constants';
import { MessagePattern } from '@nestjs/microservices';
import { GetAllUserChatsOutputDto } from './dto/output-dto/get-all-user-chats.output.dto';
import { Pagination } from '@app/paginator';
import { GetChatByIdInputDto } from './dto/input-dto/get-chat-by-id.input.dto';
import { GetChatByIdQuery } from '../application/query-bus/get-chat-by-id.use-case';
import { ChatOutputDto } from './dto/output-dto/get-chat-by-id.output.dto';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly logger: LoggerService,
    private readonly queryBus: QueryBus,
  ) {
    this.logger.setContext(ChatController.name);
  }

  @MessagePattern({ cmd: GET_USERS_CHATS_MESSENGER })
  async getAllChatForUser(
    body: GetAllChatsInputDto,
  ): Promise<
    AppNotificationResultType<Pagination<GetAllUserChatsOutputDto[]>>
  > {
    this.logger.debug('Execute: get user chats', this.getAllChatForUser.name);

    const result: AppNotificationResultType<
      Pagination<GetAllUserChatsOutputDto[]>
    > = await this.queryBus.execute(
      new GetAllChatsForUserQuery(
        body.userId,
        body.query,
        body.endCursorChatId,
      ),
    );

    this.logger.debug(result.appResult, this.getAllChatForUser.name);

    return result;
  }

  @MessagePattern({ cmd: GET_CHAT })
  async getChatById(
    body: GetChatByIdInputDto,
  ): Promise<AppNotificationResultType<ChatOutputDto>> {
    this.logger.debug('Execute: get chat by id', this.getChatById.name);

    const result: AppNotificationResultType<ChatOutputDto> =
      await this.queryBus.execute(
        new GetChatByIdQuery(body.chatId, body.participantId),
      );

    this.logger.debug(result.appResult, this.getAllChatForUser.name);

    return result;
  }
}
