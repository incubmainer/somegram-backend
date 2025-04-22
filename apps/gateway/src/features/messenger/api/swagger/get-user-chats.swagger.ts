import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { GetUserChatsOutputPaginationDto } from '../dto/output-dto/get-user-chats.output.dto';

export function GetUserChatsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all user chats' }),
    ApiParam({
      name: 'endCursorChatId',
      required: false,
    }),
    ApiOkResponse({
      description: 'Success',
      type: GetUserChatsOutputPaginationDto,
    }),
  );
}
