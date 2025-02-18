import { Controller, Delete, Get } from '@nestjs/common';
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
  WS_NEW_NOTIFICATION_EVENT,
} from '../../../../common/constants/ws-events.constants';
import {
  UnprocessableExceptionErrorDto,
  WsResponseDto,
} from '@app/base-types-enum';
import { NotificationOutputDto } from '../dto/output-dto/notification.output.dto';
import { AppNotificationResultEnum } from '@app/application-notification';

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
@Controller(`wss://somegram.online/${NOTIFICATION_NAME_SPACE}`)
export class NotificationSwaggerController {
  @ApiOperation({
    summary: `Connection and listen notifications by event "${WS_NEW_NOTIFICATION_EVENT}"`,
    description: `WebSocket server: \`wss://somegram.online/${NOTIFICATION_NAME_SPACE}\` 
    \n The access token must be passed in the \`'Authorization'\` header.`,
  })
  @Get()
  @ApiOkResponse({
    description: 'New notification',
    type: WsNotificationEventResponse,
  })
  connection() {
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
