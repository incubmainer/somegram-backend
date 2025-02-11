import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiNoContentResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';

export function ReadNotificationByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Read notification by id for current user',
    }),
    ApiParam({ name: 'notificationId' }),
    ApiNoContentResponse({
      description: 'Success',
    }),
    ApiForbiddenResponse({
      description: 'The notification does not belong to the current user',
    }),
    ApiNotFoundResponse({
      description: 'Notification not found',
    }),
  );
}
