import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { NotificationOutputDto } from '../dto/output-dto/notification.output.dto';

export function GetNotificationsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get notifications of the current user (for 1 month)',
    }),
    ApiOkResponse({
      description: 'Success',
      type: NotificationOutputDto,
      isArray: true,
    }),
  );
}
