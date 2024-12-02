import { applyDecorators } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function TerminateAllDevicesExcludeCurrentSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'End all sessions except the current one' }),
    ApiNoContentResponse({
      description: 'Success',
    }),
    ApiForbiddenResponse({
      description: 'If the devices do not belong to the current user',
    }),
  );
}
