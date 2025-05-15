import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { Pagination, PaginatorService } from '@app/paginator';
import { LoggerService } from '@app/logger';
import {
  GetChatMessagesOutputDto,
  GetChatMessagesOutputDtoMapper,
} from '../../api/dto/output-dto/get-chat-messages.output.dto';
import { MessageQueryRepository } from '../../infrastructure/message.query-repository';
import { ChatQueryRepository } from '../../../chat/infrastructure/chat.query-repository';
import { GetChatMessagesInputDto } from '../../api/dto/input-dto/get-chat-messages.input.dto';

export class GetChatMessagesQuery implements IQuery {
  constructor(public inputDto: GetChatMessagesInputDto) {}
}

@QueryHandler(GetChatMessagesQuery)
export class GetChatMessagesUseCase
  implements
    IQueryHandler<
      GetChatMessagesQuery,
      AppNotificationResultType<Pagination<GetChatMessagesOutputDto[]>>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly chatQueryRepository: ChatQueryRepository,
    private readonly paginatorService: PaginatorService,
    private readonly messageQueryRepository: MessageQueryRepository,
    private readonly getChatMessagesOutputDtoMapper: GetChatMessagesOutputDtoMapper,
  ) {
    this.logger.setContext(GetChatMessagesUseCase.name);
  }

  async execute(
    query: GetChatMessagesQuery,
  ): Promise<
    AppNotificationResultType<Pagination<GetChatMessagesOutputDto[]>>
  > {
    this.logger.debug('Execute: get chat messages query', this.execute.name);
    const {
      currentParticipantId,
      chatId,
      endCursorMessageId,
      query: queryParams,
    } = query.inputDto;
    const { pageSize, pageNumber } = queryParams;

    try {
      const chatAndParticipants =
        await this.chatQueryRepository.getChatAndParticipantsByChatId(chatId);

      if (!chatAndParticipants) return this.appNotification.notFound();
      const { chat, participants } = chatAndParticipants;
      if (!participants?.some((p) => p.userId === currentParticipantId))
        return this.appNotification.forbidden();

      const { items, total } =
        await this.messageQueryRepository.getChatMessages(
          chat.id,
          pageSize,
          endCursorMessageId,
        );

      const result = this.paginatorService.create(
        pageNumber,
        pageSize,
        total,
        this.getChatMessagesOutputDtoMapper.mapMessages(
          items,
          currentParticipantId,
        ),
      );

      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
