import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { ChatQueryRepository } from '../../infrastructure/chat.query-repository';
import {
  ChatOutputDto,
  ChatOutputDtoMapper,
} from '../../api/dto/output-dto/get-chat-by-id.output.dto';

export class GetChatByIdQuery implements IQuery {
  constructor(
    public chatId: string,
    public participantId: string,
  ) {}
}

@QueryHandler(GetChatByIdQuery)
export class GetChatByIdQueryUseCase
  implements
    IQueryHandler<GetChatByIdQuery, AppNotificationResultType<ChatOutputDto>>
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly chatQueryRepository: ChatQueryRepository,
    private readonly chatOutputDtoMapper: ChatOutputDtoMapper,
  ) {
    this.logger.setContext(GetChatByIdQueryUseCase.name);
  }

  async execute(
    query: GetChatByIdQuery,
  ): Promise<AppNotificationResultType<ChatOutputDto>> {
    this.logger.debug('Execute: get chat by id query', this.execute.name);
    const { participantId, chatId } = query;
    try {
      const result =
        await this.chatQueryRepository.getChatAndParticipantsByChatId(chatId);

      if (!result) return this.appNotification.notFound();

      const { chat, participants } = result;

      if (!participants.some((u) => (u.userId = participantId)))
        return this.appNotification.forbidden();

      return this.appNotification.success(
        this.chatOutputDtoMapper.mapChat(chat),
      );
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
