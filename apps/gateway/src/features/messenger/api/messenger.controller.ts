import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LoggerService } from '@app/logger';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MESSENGER_ROUTE } from '../../../common/constants/route.constants';
import { JWTAccessTokenPayloadType } from '../../auth/domain/types';
import { SearchQueryParametersWithoutSorting } from '../../../common/domain/query.types';
import { CurrentUser } from '@app/decorators/http-parse/current-user';
import { AuthGuard } from '@nestjs/passport';
import {
  ApplicationNotification,
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { GetUserChatsQuery } from '../application/query-bus/get-user-chats.use-case';
import { Pagination } from '@app/paginator';
import { GetUserChatsOutputDto } from './dto/output-dto/get-user-chats.output.dto';
import { SendMessageCommand } from '../application/use-case/send-message.use-case';
import { SendMessageInputDto } from './dto/input-dto/send-message.input.dto';
import { SendMessageSwagger } from './swagger/send-message.swagger';
import { GetUserChatsSwagger } from './swagger/get-user-chats.swagger';
import { GetChatMessagesQuery } from '../application/query-bus/get-chat-messages.use-case';
import { GetChatMessagesSwagger } from './swagger/get-chat-messages.swagger';
import { GetChatMessagesQueryParams } from './dto/input-dto/get-chat-messages.query.params';
import { ChatMessagesOutputDto } from './dto/output-dto/get-chat-messages.output.dto';
import { ReadMessageSwagger } from './swagger/read-message.swagger';
import { ReadMessageCommand } from '../application/use-case/read-message.use-case';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  MESSAGE_READ,
  NEW_MESSAGE,
} from '../../../common/constants/service.constants';
import { NewMessageGatewayDto } from '../domain/types';
import { NewMessageEvent } from '../application/events/new-message.event';
import { MessageReadEvent } from '../application/events/message-read.event';

@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiTags('Messenger')
@Controller(MESSENGER_ROUTE.MAIN)
export class MessengerController {
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {
    this.logger.setContext(MessengerController.name);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(`${MESSENGER_ROUTE.CHAT}/:endCursorChatId?`)
  @GetUserChatsSwagger()
  async getUserChats(
    @CurrentUser() user: JWTAccessTokenPayloadType,
    @Query() query: SearchQueryParametersWithoutSorting,
    @Param('endCursorChatId') endCursorChatId?: string,
  ): Promise<Pagination<GetUserChatsOutputDto[]>> {
    this.logger.debug('Execute: get user chats', this.getUserChats.name);
    const result: AppNotificationResultType<
      Pagination<GetUserChatsOutputDto[]>
    > = await this.queryBus.execute(
      new GetUserChatsQuery(user.userId, query, endCursorChatId || null),
    );

    this.logger.debug(result.appResult, this.getUserChats.name);

    if (result.appResult === AppNotificationResultEnum.Success)
      return result.data;

    this.appNotification.handleHttpResult(result);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(`${MESSENGER_ROUTE.CHAT}/:participantId`)
  @SendMessageSwagger()
  async sendMessage(
    @CurrentUser() user: JWTAccessTokenPayloadType,
    @Param('participantId') participantId: string,
    @Body() body: SendMessageInputDto,
  ): Promise<ChatMessagesOutputDto | void> {
    this.logger.debug('Execute: send new message', this.sendMessage.name);
    const result: AppNotificationResultType<ChatMessagesOutputDto> =
      await this.commandBus.execute(
        new SendMessageCommand(user.userId, participantId, body.message),
      );

    this.logger.debug(result.appResult, this.sendMessage.name);

    if (result.appResult === AppNotificationResultEnum.Success)
      return result.data;

    this.appNotification.handleHttpResult(result);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(
    `${MESSENGER_ROUTE.CHAT}/:chatId/${MESSENGER_ROUTE.MESSAGES}/:endCursorMessageId?`,
  )
  @GetChatMessagesSwagger()
  async getChatMessages(
    @CurrentUser() user: JWTAccessTokenPayloadType,
    @Query() query: GetChatMessagesQueryParams,
    @Param('chatId') chatId: string,
    @Param('endCursorMessageId') endCursorMessageId?: string,
  ): Promise<Pagination<ChatMessagesOutputDto[]>> {
    this.logger.debug('Execute: get chat messages', this.getChatMessages.name);
    const result: AppNotificationResultType<
      Pagination<ChatMessagesOutputDto[]>
    > = await this.queryBus.execute(
      new GetChatMessagesQuery(
        user.userId,
        chatId,
        endCursorMessageId || null,
        query,
      ),
    );

    this.logger.debug(result.appResult, this.getChatMessages.name);

    if (result.appResult === AppNotificationResultEnum.Success)
      return result.data;

    this.appNotification.handleHttpResult(result);
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(`${MESSENGER_ROUTE.CHAT}/:messageId/${MESSENGER_ROUTE.MESSAGES}`)
  @ReadMessageSwagger()
  async readMessage(
    @CurrentUser() user: JWTAccessTokenPayloadType,
    @Param('messageId') messageId: string,
  ): Promise<void> {
    this.logger.debug('Execute: read message', this.readMessage.name);
    const result: AppNotificationResultType<null> =
      await this.commandBus.execute(
        new ReadMessageCommand(user.userId, messageId),
      );

    this.logger.debug(result.appResult, this.readMessage.name);

    this.appNotification.handleHttpResult(result);
  }

  @ApiExcludeEndpoint()
  @MessagePattern({ cmd: NEW_MESSAGE })
  async createNewMessageNotification(
    @Payload() payload: NewMessageGatewayDto,
  ): Promise<void> {
    this.logger.debug(
      'Execute: create new message notification',
      this.createNewMessageNotification.name,
    );
    await this.eventBus.publish(
      new NewMessageEvent(payload.message, payload.participantId),
    );
  }

  @ApiExcludeEndpoint()
  @MessagePattern({ cmd: MESSAGE_READ })
  async messageReadNotification(
    @Payload() payload: NewMessageGatewayDto,
  ): Promise<void> {
    this.logger.debug(
      'Execute: message read notification',
      this.messageReadNotification.name,
    );
    await this.eventBus.publish(new MessageReadEvent(payload.message));
  }
}
