import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiNotFoundResponse,
  ApiConsumes,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { ChatMessagesOutputDto } from '../dto/output-dto/get-chat-messages.output.dto';

export function SendVoiceMessageSwagger() {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiOperation({ summary: 'Send voice message' }),
    ApiCreatedResponse({
      description: 'Success',
      type: ChatMessagesOutputDto,
    }),
    ApiNotFoundResponse({ description: 'Participant not found' }),
  );
}
