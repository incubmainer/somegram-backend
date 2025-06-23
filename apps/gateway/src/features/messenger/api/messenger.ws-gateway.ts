import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MESSENGER_NAME_SPACE } from '../../../common/constants/route.constants';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultEnum,
  AppNotificationResultType,
  WsNotification,
} from '@app/application-notification';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import {
  WS_CORS_ALLOWED_HEADERS,
  WS_CORS_METHODS,
  WS_CORS_ORIGIN,
} from '../../../common/constants/ws-cors.constants';
import { WsGateway } from '../../../common/services/ws-gateway/ws.gateway';
import { UseGuards } from '@nestjs/common';
import {
  WS_JOIN_CHAT,
  WS_JOIN_ROOM_EVENT,
  WS_LEAVE_CHAT,
  WS_LEAVE_ROOM_EVENT,
  WS_READ_MESSAGE,
  WS_SEND_MESSAGE,
} from '../../../common/constants/ws-events.constants';
import { JoinChatInputDto } from './dto/input-dto/join-chat.input.dto';
import { WsJwtAuthGuard } from '../../../common/guards/ws-jwt/ws-jwt-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetChatByIdQuery } from '../application/query-bus/get-chat-by-id.use-case';
import { WsCurrentUserId } from '../../../common/decorators/ws-parse/ws-current-user-id';
import { WsResponseDto } from '@app/base-types-enum';
import { SendMessageCommand } from '../application/use-case/send-message.use-case';
import { ReadMessageCommand } from '../application/use-case/read-message.use-case';
import { SendMessageInputDto } from './dto/input-dto/send-message.input.dto';
import { ChatDto, MessageTypeEnum, SendMessageDto } from '../domain/types';

export const WS_CHAT_ROOM_NAME = 'chat';

@WebSocketGateway({
  namespace: MESSENGER_NAME_SPACE,
  cors: {
    origin: WS_CORS_ORIGIN,
    methods: WS_CORS_METHODS,
    allowedHeaders: WS_CORS_ALLOWED_HEADERS,
  },
})
export class MessengerWsGateway
  extends WsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly leaveFromChatResponse: WsResponseDto<null>;
  private readonly joinToChatResponse: WsResponseDto<null>;
  constructor(
    logger: LoggerService,
    appNotification: ApplicationNotification,
    configService: ConfigService<ConfigurationType, true>,
    jwtService: JwtService,
    usersRepository: UsersRepository,
    wsNotification: WsNotification,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {
    super(
      logger,
      appNotification,
      configService,
      jwtService,
      usersRepository,
      wsNotification,
    );
    this.logger.setContext(MessengerWsGateway.name);
    this.leaveFromChatResponse = this.wsNotification.generate(
      'Disconnected from the room',
      AppNotificationResultEnum.Success,
      null,
    );
    this.joinToChatResponse = this.wsNotification.generate(
      'Join to the room',
      AppNotificationResultEnum.Success,
      null,
    );
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage(WS_LEAVE_CHAT)
  async handleLeaveRoom(
    @MessageBody()
    payload: JoinChatInputDto,

    @ConnectedSocket()
    client: Socket,

    @WsCurrentUserId()
    userId: string,
  ): Promise<void> {
    this.logger.debug(
      'Execute: user try to disconnect from chat',
      this.handleLeaveRoom.name,
    );
    const { chatId } = payload;

    const isJoined = this.isJoined(client, WS_CHAT_ROOM_NAME, chatId);

    if (!isJoined) {
      client.emit(WS_LEAVE_ROOM_EVENT, this.leaveFromChatResponse);
      this.logger.debug('Client already left', this.handleLeaveRoom.name);
      return;
    }

    const result: AppNotificationResultType<ChatDto> =
      await this.queryBus.execute(new GetChatByIdQuery(chatId, userId));

    if (result.appResult === AppNotificationResultEnum.Success) {
      this.leaveRoom(client, WS_CHAT_ROOM_NAME, chatId);
      client.emit(WS_LEAVE_ROOM_EVENT, this.leaveFromChatResponse);
    }

    this.logger.debug(result.appResult, this.handleLeaveRoom.name);

    this.appNotification.handleWsResult(result);
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage(WS_SEND_MESSAGE)
  async handleSendMessage(
    @MessageBody() body: SendMessageInputDto,

    @ConnectedSocket()
    client: Socket,

    @WsCurrentUserId()
    userId: string,
  ) {
    this.logger.debug(
      'Handle send message via WS',
      this.handleSendMessage.name,
    );
    const result: AppNotificationResultType<SendMessageDto> =
      await this.commandBus.execute(
        new SendMessageCommand(
          userId,
          body.participantId,
          body.message,
          MessageTypeEnum.TEXT,
        ),
      );

    if (result.appResult === AppNotificationResultEnum.Success) {
      this.logger.debug(result.appResult, this.handleSendMessage.name);

      const isJoined = this.isJoined(
        client,
        WS_CHAT_ROOM_NAME,
        result.data.chatId,
      );
      if (isJoined) {
        client.emit(WS_JOIN_ROOM_EVENT, this.joinToChatResponse);
        this.logger.debug('Client already joined', this.handleSendMessage.name);
      } else {
        const chatResult: AppNotificationResultType<ChatDto> =
          await this.queryBus.execute(
            new GetChatByIdQuery(result.data.chatId, userId),
          );

        if (chatResult.appResult === AppNotificationResultEnum.Success) {
          this.joinRoom(client, WS_CHAT_ROOM_NAME, result.data.chatId);
          client.emit(WS_JOIN_ROOM_EVENT, this.joinToChatResponse);
        }
      }
    }

    this.appNotification.handleWsResult(result);
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage(WS_READ_MESSAGE)
  async handleReadMessage(
    @MessageBody() body: { messageId: string },

    @ConnectedSocket()
    client: Socket,

    @WsCurrentUserId()
    userId: string,
  ) {
    this.logger.debug('Handle read message via WS');
    const result: AppNotificationResultType<null> =
      await this.commandBus.execute(
        new ReadMessageCommand(userId, body.messageId),
      );
    this.logger.debug(result.appResult, this.handleReadMessage.name);
    this.appNotification.handleWsResult(result);
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage(WS_JOIN_CHAT)
  async joinToChat(
    @MessageBody() body: JoinChatInputDto,

    @ConnectedSocket()
    client: Socket,

    @WsCurrentUserId()
    userId: string,
  ) {
    this.logger.debug(
      'Handle join client to chat via WS',
      this.joinToChat.name,
    );

    const { chatId } = body;

    const isJoined = this.isJoined(client, WS_CHAT_ROOM_NAME, chatId);
    if (isJoined) {
      client.emit(WS_JOIN_ROOM_EVENT, this.joinToChatResponse);
      this.logger.debug('Client already joined', this.joinToChat.name);
    } else {
      const chatResult: AppNotificationResultType<ChatDto> =
        await this.queryBus.execute(new GetChatByIdQuery(chatId, userId));

      if (chatResult.appResult === AppNotificationResultEnum.Success) {
        this.joinRoom(client, WS_CHAT_ROOM_NAME, chatId);
        client.emit(WS_JOIN_ROOM_EVENT, this.joinToChatResponse);
      } else {
        this.appNotification.handleWsResult(chatResult);
      }
    }
  }
}
