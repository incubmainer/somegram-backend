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
import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WsExceptionFilter } from '../../../common/exception-filter/ws/ws.exception-filter';
import { WsValidationPipeOption } from '../../../common/pipe/validation/ws-validation-options.pipe';
import { WS_JOIN_CHAT } from '../../../common/constants/ws-events.constants';
import { JoinChatInputDto } from './dto/input-dto/join-chat.input.dto';
import { WsJwtAuthGuard } from '../../../common/guards/ws-jwt/ws-jwt-auth.guard';
import { QueryBus } from '@nestjs/cqrs';
import { GetChatByIdQuery } from '../application/query-bus/get-chat-by-id.use-case';
import { WsCurrentUserId } from '../../../common/decorators/ws-parse/ws-current-user-id';
import { ChatOutputDto } from '../../../../../messenger/src/features/chat/api/dto/output-dto/get-chat-by-id.output.dto';

export const WS_CHAT_ROOM_NAME = 'chat';

@UseFilters(WsExceptionFilter)
@UsePipes(new ValidationPipe(new WsValidationPipeOption()))
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
  constructor(
    logger: LoggerService,
    appNotification: ApplicationNotification,
    configService: ConfigService<ConfigurationType, true>,
    jwtService: JwtService,
    usersRepository: UsersRepository,
    wsNotification: WsNotification,
    private readonly queryBus: QueryBus,
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
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage(WS_JOIN_CHAT)
  async handleJoinRoom(
    @MessageBody()
    payload: JoinChatInputDto,

    @ConnectedSocket()
    client: Socket,

    @WsCurrentUserId()
    userId: string,
  ): Promise<void> {
    const { chatId } = payload;

    const result: AppNotificationResultType<ChatOutputDto> =
      await this.queryBus.execute(new GetChatByIdQuery(chatId, userId));

    if (result.appResult === AppNotificationResultEnum.Success)
      this.joinRoom(client, WS_CHAT_ROOM_NAME, chatId);

    this.appNotification.handleWsResult(result);
  }
}
