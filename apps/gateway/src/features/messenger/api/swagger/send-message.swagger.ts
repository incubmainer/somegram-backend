import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiUnprocessableEntityResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { UnprocessableExceptionDto } from '@app/base-types-enum';
import { SendMessageOutputDto } from '../../../../../../messenger/src/features/message/api/dto/output-dto/send-message.output.dto';

export function SendMessageSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Send new message' }),
    ApiCreatedResponse({
      description: 'Success',
      type: SendMessageOutputDto,
    }),
    ApiNotFoundResponse({ description: 'Chat participant was not found' }),
    ApiUnprocessableEntityResponse({
      description: 'Validation failed',
      type: UnprocessableExceptionDto,
    }),
  );
}
