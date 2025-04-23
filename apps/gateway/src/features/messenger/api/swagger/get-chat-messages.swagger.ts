import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiParam,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { ChatMessagesOutputPaginationDto } from '../dto/output-dto/get-chat-messages.output.dto';

export function GetChatMessagesSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get chat messages' }),
    ApiParam({
      name: 'endCursorMessageId',
      required: false,
    }),
    ApiOkResponse({
      description: 'Success',
      type: ChatMessagesOutputPaginationDto,
    }),
    ApiForbiddenResponse({
      description: 'The user is not a participant of the chat',
    }),
  );
}
