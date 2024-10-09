import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { MAX_PHOTO_SIZE } from '../../application/use-cases/upload-photo.use-case';
import { ALLOWED_MIMETYPES } from '../../../../common/decorators/is-valid-file';

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
            description: `File must be present, less than ${MAX_PHOTO_SIZE} MB, and of type: ${ALLOWED_MIMETYPES.join(', ')}`,
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Photo upload successful',
      schema: {
        example: {
          photoKey: 'AddPostCommand',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Transaction error',
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
