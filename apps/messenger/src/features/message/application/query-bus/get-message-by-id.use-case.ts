import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import {
  GetChatMessagesOutputDto,
  GetChatMessagesOutputDtoMapper,
} from '../../api/dto/output-dto/get-chat-messages.output.dto';
import { MessageQueryRepository } from '../../infrastructure/message.query-repository';

export class GetMessageByIdQuery implements IQuery {
  constructor(
    public messageId: string,
    public participantId: string,
  ) {}
}

@QueryHandler(GetMessageByIdQuery)
export class GetMessageByIdUseCase
  implements
    IQueryHandler<
      GetMessageByIdQuery,
      AppNotificationResultType<GetChatMessagesOutputDto>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly messageQueryRepository: MessageQueryRepository,
    private readonly getChatMessagesOutputDtoMapper: GetChatMessagesOutputDtoMapper,
  ) {
    this.logger.setContext(GetMessageByIdUseCase.name);
  }

  async execute(
    query: GetMessageByIdQuery,
  ): Promise<AppNotificationResultType<GetChatMessagesOutputDto>> {
    this.logger.debug('Execute: get message by id', this.execute.name);
    const { participantId, messageId } = query;
    try {
      const message =
        await this.messageQueryRepository.getMessageByIdWithChatParticipant(
          messageId,
        );

      if (!message) return this.appNotification.notFound();
      if (!message.Chat?.Participants?.some((p) => p.userId === participantId))
        return this.appNotification.forbidden();

      const result = this.getChatMessagesOutputDtoMapper.mapMessage(
        message,
        participantId,
      );

      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
