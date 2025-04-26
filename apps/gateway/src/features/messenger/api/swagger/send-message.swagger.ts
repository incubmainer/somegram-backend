import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiUnprocessableEntityResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { UnprocessableExceptionDto } from '@app/base-types-enum';
import { ChatMessagesOutputDto } from '../dto/output-dto/get-chat-messages.output.dto';

export function SendMessageSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Send new message' }),
    ApiCreatedResponse({
      description: 'Success',
      type: ChatMessagesOutputDto,
    }),
    ApiNotFoundResponse({ description: 'Chat participant was not found' }),
    ApiUnprocessableEntityResponse({
      description: 'Validation failed',
      type: UnprocessableExceptionDto,
    }),
  );
}
