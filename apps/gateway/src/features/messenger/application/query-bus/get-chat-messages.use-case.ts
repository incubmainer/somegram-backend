import { LoggerService } from '@app/logger';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { Pagination } from '@app/paginator';
import { MessengerServiceAdapter } from '../../../../common/adapter/messenger-service.adapter';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';
import {
  ChatMessagesOutputDto,
  ChatMessagesOutputDtoMapper,
} from '../../api/dto/output-dto/get-chat-messages.output.dto';
import { GetChatMessagesQueryParams } from '../../api/dto/input-dto/get-chat-messages.query.params';

export class GetChatMessagesQuery implements IQuery {
  constructor(
    public userId: string,
    public chatId: string,
    public endCursorMessageId: string | null,
    public query: GetChatMessagesQueryParams,
  ) {}
}

@QueryHandler(GetChatMessagesQuery)
export class GetChatMessagesQueryUseCase
  implements
    IQueryHandler<
      GetChatMessagesQuery,
      AppNotificationResultType<Pagination<ChatMessagesOutputDto[]>>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly messengerServiceAdapter: MessengerServiceAdapter,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly chatMessagesOutputDtoMapper: ChatMessagesOutputDtoMapper,
  ) {
    this.logger.setContext(GetChatMessagesQueryUseCase.name);
  }

  async execute(
    query: GetChatMessagesQuery,
  ): Promise<AppNotificationResultType<Pagination<ChatMessagesOutputDto[]>>> {
    this.logger.debug('Execute: get chat messages query', this.execute.name);
    const { userId, chatId, endCursorMessageId, query: queryParams } = query;
    try {
      const resultMessages = await this.messengerServiceAdapter.getChatMessages(
        userId,
        chatId,
        queryParams,
        endCursorMessageId,
      );

      if (resultMessages.appResult !== AppNotificationResultEnum.Success)
        return resultMessages as AppNotificationResultType<null>;

      const ids = [userId];

      const secondParticipantId = resultMessages.data.items.find(
        (i) => i.senderId !== userId,
      )?.senderId;

      if (secondParticipantId) {
        ids.push(secondParticipantId);
      }

      const avatars = await this.photoServiceAdapter.getUsersAvatar(ids);

      const users = await this.usersQueryRepository.getUsersAndUsersIsBan(ids);

      const { pagesCount, totalCount, pageNumber, pageSize, items } =
        resultMessages.data;
      const result: Pagination<ChatMessagesOutputDto[]> = {
        pagesCount,
        pageNumber,
        pageSize,
        totalCount,
        items:
          items && items.length > 0
            ? this.chatMessagesOutputDtoMapper.mapMessages(
                resultMessages.data.items,
                avatars,
                users,
              )
            : [],
      };

      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
