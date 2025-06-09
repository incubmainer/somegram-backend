import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable, timeout } from 'rxjs';
import {
  GET_CHAT,
  GET_CHAT_MESSAGES,
  GET_USERS_CHATS_MESSENGER,
  READ_MESSAGE,
  SEND_MESSAGE_TO_CHAT,
} from '../constants/service.constants';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { SearchQueryParametersWithoutSorting } from '../domain/query.types';
import { Pagination } from '@app/paginator';
import {
  AllUserChatsDto,
  ChatDto,
  ChatMessagesDto,
  CreateMessageDto,
  ReadMessageDto,
  SendMessageDto,
} from '../../features/messenger/domain/types';
import { GetChatMessagesQueryParams } from '../../features/messenger/api/dto/input-dto/get-chat-messages.query.params';

@Injectable()
export class MessengerServiceAdapter {
  constructor(
    @Inject('MESSENGER_SERVICE')
    private readonly messengerServiceClient: ClientProxy,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
  ) {}

  async getUserChats(
    userId: string,
    query: SearchQueryParametersWithoutSorting,
    endCursorChatId: string | null,
  ): Promise<AppNotificationResultType<Pagination<AllUserChatsDto[]>>> {
    try {
      const responseOfService: Observable<
        AppNotificationResultType<Pagination<AllUserChatsDto[]>>
      > = this.messengerServiceClient
        .send(
          { cmd: GET_USERS_CHATS_MESSENGER },
          {
            userId,
            query,
            endCursorChatId,
          },
        )
        .pipe(timeout(20000));
      return await firstValueFrom(responseOfService);
    } catch (e) {
      this.logger.error(e, this.getUserChats.name);
      return this.appNotification.internalServerError();
    }
  }

  async sendMessage(
    body: CreateMessageDto,
  ): Promise<AppNotificationResultType<SendMessageDto>> {
    try {
      const responseOfService: Observable<
        AppNotificationResultType<SendMessageDto>
      > = this.messengerServiceClient
        .send({ cmd: SEND_MESSAGE_TO_CHAT }, body)
        .pipe(timeout(20000));
      return await firstValueFrom(responseOfService);
    } catch (e) {
      this.logger.error(e, this.getUserChats.name);
      return this.appNotification.internalServerError();
    }
  }

  async readMessage(
    body: ReadMessageDto,
  ): Promise<AppNotificationResultType<null>> {
    try {
      const responseOfService: Observable<AppNotificationResultType<null>> =
        this.messengerServiceClient
          .send({ cmd: READ_MESSAGE }, body)
          .pipe(timeout(20000));
      return await firstValueFrom(responseOfService);
    } catch (e) {
      this.logger.error(e, this.getUserChats.name);
      return this.appNotification.internalServerError();
    }
  }

  async getChatMessages(
    currentParticipantId: string,
    chatId: string,
    query: GetChatMessagesQueryParams,
    endCursorMessageId: string | null,
  ): Promise<AppNotificationResultType<Pagination<ChatMessagesDto[]>>> {
    try {
      const responseOfService: Observable<
        AppNotificationResultType<Pagination<ChatMessagesDto[]>>
      > = this.messengerServiceClient
        .send(
          { cmd: GET_CHAT_MESSAGES },
          {
            currentParticipantId,
            chatId,
            query,
            endCursorMessageId,
          },
        )
        .pipe(timeout(20000));
      return await firstValueFrom(responseOfService);
    } catch (e) {
      this.logger.error(e, this.getUserChats.name);
      return this.appNotification.internalServerError();
    }
  }

  async getChatById(
    chatId: string,
    participantId: string,
  ): Promise<AppNotificationResultType<ChatDto>> {
    try {
      const responseOfService: Observable<AppNotificationResultType<ChatDto>> =
        this.messengerServiceClient
          .send(
            { cmd: GET_CHAT },
            {
              chatId,
              participantId,
            },
          )
          .pipe(timeout(20000));
      return await firstValueFrom(responseOfService);
    } catch (e) {
      this.logger.error(e, this.getUserChats.name);
      return this.appNotification.internalServerError();
    }
  }
}
