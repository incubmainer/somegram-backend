import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable, timeout } from 'rxjs';
import {
  GET_USERS_CHATS_MESSENGER,
  SEND_MESSAGE_TO_CHAT,
} from '../constants/service.constants';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { SearchQueryParametersWithoutSorting } from '../domain/query.types';
import { Pagination } from '@app/paginator';
import { GetAllUserChatsOutputDto } from '../../../../messenger/src/features/chat/api/dto/output-dto/get-all-user-chats.output.dto';
import { CreateMessageDto } from '../../features/messenger/domain/types';

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
  ): Promise<
    AppNotificationResultType<Pagination<GetAllUserChatsOutputDto[]>>
  > {
    try {
      const responseOfService: Observable<
        AppNotificationResultType<Pagination<GetAllUserChatsOutputDto[]>>
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
  ): Promise<AppNotificationResultType<null>> {
    try {
      const responseOfService: Observable<AppNotificationResultType<null>> =
        this.messengerServiceClient
          .send({ cmd: SEND_MESSAGE_TO_CHAT }, body)
          .pipe(timeout(20000));
      return await firstValueFrom(responseOfService);
    } catch (e) {
      this.logger.error(e, this.getUserChats.name);
      return this.appNotification.internalServerError();
    }
  }
}
