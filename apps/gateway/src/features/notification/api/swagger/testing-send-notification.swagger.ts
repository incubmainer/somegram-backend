import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiNoContentResponse } from '@nestjs/swagger';

export function TestingSendNotificationSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Testing send new notification into websocket connection',
    }),
    ApiNoContentResponse({
      description: 'Success',
    }),
  );
}
