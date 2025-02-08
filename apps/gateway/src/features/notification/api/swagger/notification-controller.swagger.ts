import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
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
import { NOTIFICATION_NAME_SPACE } from '../../../../common/constants/route.constants';
import {
  WS_ERROR_EVENT,
  WS_MARK_NOTIFICATION_EVENT,
  WS_NEW_NOTIFICATION_EVENT,
  WS_NOTIFICATION_READ_EVENT,
  WS_NOTIFICATIONS_EVENT,
} from '../../../../common/constants/ws-events.constants';
import {
  UnprocessableExceptionErrorDto,
  WsResponseDto,
} from '@app/base-types-enum';
import { NotificationOutputDto } from '../dto/output-dto/notification.output.dto';
import { AppNotificationResultEnum } from '@app/application-notification';
import { MarkNotificationAsReadInputDto } from '../dto/input-dto/notification.input-dto';

class WsNotificationsEventResponse extends WsResponseDto<NotificationOutputDto> {
  @ApiProperty({
    type: NotificationOutputDto,
    isArray: true,
  })
  payload: NotificationOutputDto;
}

class WsNotificationEventResponse extends WsResponseDto<NotificationOutputDto> {
  @ApiProperty({
    type: NotificationOutputDto,
  })
  payload: NotificationOutputDto;
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

@ApiTags('WebSocket notification API')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({
  description: 'Unauthorized response',
  type: UnauthorizedResponse,
})
@Controller(`ws://localhost/${NOTIFICATION_NAME_SPACE}`)
export class NotificationSwaggerController {
  @ApiOperation({
    summary: 'Connection',
    description: `WebSocket server: \`/localhost/${NOTIFICATION_NAME_SPACE}\` 
    \n The access token must be passed in the \`'Authorization'\` header.`,
  })
  @Get()
  connection() {
    return 'There is nothing here.';
  }

  @ApiOperation({
    summary: 'Obtaining the latest notifications (for 1 month)',
    description: 'Sent when connected to WebSocket server',
  })
  @ApiOkResponse({
    description: 'List of the latest notification of the current user',
    type: WsNotificationsEventResponse,
  })
  @Get(WS_NOTIFICATIONS_EVENT)
  connectEvent() {
    return 'There is nothing here.';
  }

  @ApiOperation({
    summary: 'Receiving a new notification',
  })
  @ApiOkResponse({
    description: 'New notification',
    type: WsNotificationEventResponse,
  })
  @Get(WS_NEW_NOTIFICATION_EVENT)
  newNotification() {
    return 'There is nothing here.';
  }

  @ApiOperation({
    summary: 'Read a notification',
    description: `The result of the operation is returned in the event: \`${WS_NOTIFICATION_READ_EVENT}\``,
  })
  @ApiOkResponse({
    description: 'The result of the operation',
    type: WsResponseDto<null>,
  })
  @ApiForbiddenResponse({
    description: 'The notification does not belong to the current user',
    type: ForbiddenResponse,
  })
  @ApiNotFoundResponse({
    description: 'The notification not found',
    type: NotFoundResponse,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error',
    type: UnprocessableEntityResponse,
  })
  @Post(WS_MARK_NOTIFICATION_EVENT)
  readNotification(@Body() dto: MarkNotificationAsReadInputDto) {
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
