import { LoggerService } from '@app/logger';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { MessengerServiceAdapter } from '../../../../common/adapter/messenger-service.adapter';
import { ChatMessagesOutputDto } from '../../api/dto/output-dto/get-chat-messages.output.dto';
import { MessengerService } from '../messenger.service';

export class GetMessageByIdQuery implements IQuery {
  constructor(
    public messageId: string,
    public participantId: string,
  ) {}
}

@QueryHandler(GetMessageByIdQuery)
export class GetMessageByIdQueryUseCase
  implements
    IQueryHandler<
      GetMessageByIdQuery,
      AppNotificationResultType<ChatMessagesOutputDto>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly messengerServiceAdapter: MessengerServiceAdapter,
    private readonly messengerService: MessengerService,
  ) {
    this.logger.setContext(GetMessageByIdQueryUseCase.name);
  }

  async execute(
    query: GetMessageByIdQuery,
  ): Promise<AppNotificationResultType<ChatMessagesOutputDto>> {
    this.logger.debug('Execute: get message by id query', this.execute.name);
    const { messageId, participantId } = query;
    try {
      const result = await this.messengerServiceAdapter.getMessageById(
        messageId,
        participantId,
      );

      if (result.appResult !== AppNotificationResultEnum.Success)
        return result as AppNotificationResultType<null>;

      const message = await this.messengerService.handleMessage(result.data);
      return this.appNotification.success(message);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
