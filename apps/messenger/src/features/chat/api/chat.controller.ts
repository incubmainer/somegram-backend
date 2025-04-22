import { Controller } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { AppNotificationResultType } from '@app/application-notification';
import { QueryBus } from '@nestjs/cqrs';
import { GetAllChatsForUserQuery } from '../application/query-bus/get-all-chats-for-for-user.use-case';
import { GetAllChatsInputDto } from './dto/input-dto/get-all-chats.input.dto';
import { GET_USERS_CHATS_MESSENGER } from '../../../../../gateway/src/common/constants/service.constants';
import { MessagePattern } from '@nestjs/microservices';
import { GetAllUserChatsOutputDto } from './dto/output-dto/get-all-user-chats.output.dto';
import { Pagination } from '@app/paginator';

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
}
