import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiNoContentResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { UnprocessableExceptionDto } from '@app/base-types-enum';

export function UploadAvatarSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Upload User Avatar' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      type: 'multipart/form-data',
      required: true,
      schema: {
        type: 'object',
        required: ['file'],
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description:
              'The user avatar image file. Must be in JPEG or PNG format and not exceed 10 MB in size.',
          },
        },
      },
    }),
    ApiNoContentResponse({ description: 'Avatar upload successful' }),
    ApiUnprocessableEntityResponse({
      description: 'Validation failed',
      type: UnprocessableExceptionDto,
    }),
  );
}
