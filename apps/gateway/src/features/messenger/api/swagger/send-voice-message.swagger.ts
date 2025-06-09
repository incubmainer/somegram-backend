import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiConsumes,
} from '@nestjs/swagger';

export function SendVoiceMessageSwagger() {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiOperation({ summary: 'Remove messages by ids' }),
    ApiNoContentResponse({
      description: 'Success',
    }),
    ApiNotFoundResponse({ description: 'Participant not found' }),
  );
}
