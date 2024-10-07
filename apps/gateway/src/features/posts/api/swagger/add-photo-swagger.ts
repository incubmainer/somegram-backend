import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { MAX_PHOTO_SIZE } from '../../application/use-cases/upload-photo.use-case';

export function AddPhotoSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Add photo for post' }),
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
            description: `The post image file. Must be in JPEG or PNG format and not exceed ${MAX_PHOTO_SIZE} MB in size.`,
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Photo upload successful',
      schema: {
        example: {
          photoKey: '3686962b-f029-4ab3-9d19-42ec6d341696',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Transaction error',
      schema: {
        example: {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Transaction error',
        },
      },
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
  );
}
