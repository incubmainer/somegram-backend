import { LoggerService } from '@app/logger';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { MessengerServiceAdapter } from '../../../../common/adapter/messenger-service.adapter';
import { ChatOutputDto } from '../../../../../../messenger/src/features/chat/api/dto/output-dto/get-chat-by-id.output.dto';

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
    private readonly messengerServiceAdapter: MessengerServiceAdapter,
  ) {
    this.logger.setContext(GetChatByIdQueryUseCase.name);
  }

  async execute(
    query: GetChatByIdQuery,
  ): Promise<AppNotificationResultType<ChatOutputDto>> {
    this.logger.debug('Execute: get chat messages query', this.execute.name);
    const { chatId, participantId } = query;
    try {
      const result = await this.messengerServiceAdapter.getChatById(
        chatId,
        participantId,
      );

      if (result.appResult !== AppNotificationResultEnum.Success)
        return result as AppNotificationResultType<null>;

      return this.appNotification.success(result.data);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
