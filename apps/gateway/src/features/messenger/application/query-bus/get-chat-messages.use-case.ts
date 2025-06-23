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
import { MessageTypeEnum } from '../../domain/types';

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

      const secondParticipantMessage = resultMessages.data.items.find(
        (i) => i.participant.userId !== userId || i.sender.userId !== userId,
      );

      let secondParticipantId: string | null = null;

      if (secondParticipantMessage) {
        if (secondParticipantMessage.participant.userId !== userId) {
          secondParticipantId = secondParticipantMessage.participant.userId;
        } else if (secondParticipantMessage.sender.userId !== userId) {
          secondParticipantId = secondParticipantMessage.sender.userId;
        }
      }

      if (secondParticipantId) {
        ids.push(secondParticipantId);
      }

      const avatars = await this.photoServiceAdapter.getUsersAvatar(ids);

      const users = await this.usersQueryRepository.getUsersAndUsersIsBan(ids);

      const promises = resultMessages.data.items.map(async (message) => {
        const { messageType, id } = message;

        switch (messageType) {
          case MessageTypeEnum.VOICE:
            const voiceMessage =
              await this.photoServiceAdapter.getVoiceMessageById(id);

            if (voiceMessage) {
              message.content = voiceMessage.url;
              message.duration = voiceMessage.duration;
            }

            break;
        }

        return this.chatMessagesOutputDtoMapper.mapMessage(
          message,
          avatars,
          users,
        );
      });

      const messages = await Promise.all(promises);

      const { pagesCount, totalCount, pageNumber, pageSize } =
        resultMessages.data;
      const result: Pagination<ChatMessagesOutputDto[]> = {
        pagesCount,
        pageNumber,
        pageSize,
        totalCount,
        items: messages && messages.length > 0 ? messages : [],
      };

      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
