import { Controller, Delete, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { MESSENGER_NAME_SPACE } from '../../../../common/constants/route.constants';
import {
  WS_ERROR_EVENT,
  WS_JOIN_CHAT,
  WS_JOIN_ROOM_EVENT,
  WS_LEAVE_CHAT,
  WS_LEAVE_ROOM_EVENT,
  WS_NEW_CHAT_MESSAGE_EVENT,
  WS_NEW_MESSAGE_EVENT,
} from '../../../../common/constants/ws-events.constants';
import {
  UnprocessableExceptionErrorDto,
  WsResponseDto,
} from '@app/base-types-enum';
import { AppNotificationResultEnum } from '@app/application-notification';
import { ChatMessagesOutputDto } from '../dto/output-dto/get-chat-messages.output.dto';

class WsNewMessageEventResponse extends WsResponseDto<ChatMessagesOutputDto> {
  @ApiProperty({
    type: ChatMessagesOutputDto,
  })
  payload: ChatMessagesOutputDto;
}

class ConnectedOrDisconnectedChatResponse extends WsResponseDto<null> {
  @ApiProperty({
    description: 'Connected/Disconnected',
    example: AppNotificationResultEnum.Success,
    enum: AppNotificationResultEnum,
  })
  status: AppNotificationResultEnum.Success;
}

class UnauthorizedResponse extends WsResponseDto<null> {
  @ApiProperty({
    description: 'Unauthorized',
    example: AppNotificationResultEnum.Unauthorized,
    enum: AppNotificationResultEnum,
  })
  status: AppNotificationResultEnum;
}

class ForbiddenResponse extends WsResponseDto<null> {
  @ApiProperty({
    description: 'Forbidden',
    example: AppNotificationResultEnum.Forbidden,
    enum: AppNotificationResultEnum,
  })
  status: AppNotificationResultEnum;
}

class NotFoundResponse extends WsResponseDto<null> {
  @ApiProperty({
    description: 'Not found',
    example: AppNotificationResultEnum.NotFound,
    enum: AppNotificationResultEnum,
  })
  status: AppNotificationResultEnum;
}

class UnprocessableEntityResponse extends WsResponseDto<UnprocessableExceptionErrorDto> {
  @ApiProperty({
    description: 'Validation error',
    example: AppNotificationResultEnum.UnprocessableEntity,
    enum: AppNotificationResultEnum,
  })
  status: AppNotificationResultEnum;
  @ApiProperty({
    description: 'Validation error',
    type: UnprocessableExceptionErrorDto,
    isArray: true,
  })
  payload: UnprocessableExceptionErrorDto;
}

class InternalErrorResponse extends WsResponseDto<null> {
  @ApiProperty({
    description: 'Internal error',
    example: AppNotificationResultEnum.InternalError,
    enum: AppNotificationResultEnum,
  })
  status: AppNotificationResultEnum;
}

@ApiTags('WebSocket messenger API')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({
  description: 'Unauthorized response',
  type: UnauthorizedResponse,
})
@Controller(`wss://somegram.online/${MESSENGER_NAME_SPACE}`)
export class MessengerSwaggerController {
  @ApiOperation({
    summary: `Connection and listen notifications`,
    description: `WebSocket server: \`wss://somegram.online/${MESSENGER_NAME_SPACE}\` 
    \n The access token must be passed in the \`'Authorization'\` header.
    \n To receive new messages: \`"${WS_NEW_MESSAGE_EVENT}"\`, to receive new messages inside the chat: \`"${WS_NEW_CHAT_MESSAGE_EVENT}"\``,
  })
  @Get()
  @ApiOkResponse({
    description: 'New message',
    type: WsNewMessageEventResponse,
  })
  newMessage() {
    return 'There is nothing here.';
  }

  @ApiOperation({
    summary: `Connect and disconnect chat`,
    description: `WebSocket server: \`wss://somegram.online/${MESSENGER_NAME_SPACE}\` 
    \n The access token must be passed in the \`'Authorization'\` header.
    \n To connect to a chat between two users: \`"${WS_JOIN_CHAT}"\`, to exit the chat: \`"${WS_LEAVE_CHAT}"\`
    \n If the connection is successful, the event will return to the chat: \`"${WS_JOIN_ROOM_EVENT}\`"
    \n If you successfully disconnect from the chat, the event will return: \`"${WS_LEAVE_ROOM_EVENT}\`"`,
  })
  @Post()
  @ApiOkResponse({
    description: 'Connect to chat',
    type: ConnectedOrDisconnectedChatResponse,
  })
  @ApiNotFoundResponse({
    description: 'Chat not found',
    type: NotFoundResponse,
  })
  @ApiForbiddenResponse({
    description: 'The user is not a participant of the chat',
    type: ForbiddenResponse,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error',
    type: UnprocessableEntityResponse,
  })
  connectChat() {
    return 'There is nothing here.';
  }

  @ApiOperation({
    summary: 'Exceptions',
    description: `All exceptions are returned in the event: \`${WS_ERROR_EVENT}\``,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
    type: ForbiddenResponse,
  })
  @ApiNotFoundResponse({
    description: 'Not found',
    type: NotFoundResponse,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error',
    type: UnprocessableEntityResponse,
  })
  @ApiInternalServerErrorResponse({
    description: 'Something went wrong',
    type: InternalErrorResponse,
  })
  @Delete(WS_ERROR_EVENT)
  error() {
    return 'There is nothing here.';
  }
}
