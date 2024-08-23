import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiResponse,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

export function AddPostSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Add user post' }),
    ApiBearerAuth('access-token'),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Avatar image file',
      type: 'multipart/form-data',
      required: true,
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Avatar upload successful',
      schema: {
        example: {
          avatarUrl:
            'http://localhost:9000/somegram/users/f965e9f5-e7ae-4ae4-a5c5-2016285c72dd/avatars/f78869fa-2d3a-47b8-97c1-785693087ea7.jpeg',
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
