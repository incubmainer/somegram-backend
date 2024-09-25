import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiResponse,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

export function UploadAvatarSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Upload User Avatar' }),
    ApiBearerAuth('access-token'),
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
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Avatar upload successful',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'User not found or not authorized',
    }),
    ApiResponse({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      description: 'Validation failed',
      schema: {
        example: {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Validation failed',
          errors: [
            {
              property: 'file',
              constraints: {
                isAvatarMimetype:
                  'mimeType must be a valid MIME type: image/jpeg, image/png',
              },
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Transaction error',
    }),
  );
}
