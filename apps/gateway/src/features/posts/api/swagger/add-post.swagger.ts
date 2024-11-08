import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { POST_CONSTRAINTS } from '../dto/input-dto/add-post.dto';

export function AddPostSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Add user post' }),
    ApiBearerAuth('access-token'),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      type: 'multipart/form-data',
      required: true,
      schema: {
        type: 'object',
        required: ['files'],
        properties: {
          files: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
          description: {
            type: 'string',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Posted successful',
      schema: {
        example: {
          id: '4823a87c-2fcd-4623-9729-2e5f99fcd3e2',
          description: 'string',
          createdAt: '2024-10-07T19:07:31.632Z',
          updatedAt: '2024-10-07T20:07:32.632Z',
          images: [
            'http://serveroleg.ru:9000/somegram/users/d207dc73-8002-4804-a6d2-037b786eb568/posts/572590a6-b36b-4a3e-a1e7-e614b442e860.png',
          ],
          postOwnerInfo: {
            userId: 'd207dc73-8002-4804-a6d2-037b786eb568',
            username: 'john_dou',
            avatarUrl:
              'http://serveroleg.ru:9000/somegram/users/d207dc73-8002-4804-a6d2-037b786eb568/avatars/66841f84-cec2-4ea8-a3fd-661f74dca54b.jpeg',
          },
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
              property: 'fileName',
              constraints: {
                memetype: `Mimetype must be one of the following: ${POST_CONSTRAINTS.ALLOWED_MIMETYPES.join(', ')}`,
              },
            },
            {
              property: 'fileName',
              constraints: {
                isEmail: `File size must not exceed ${POST_CONSTRAINTS.MAX_PHOTO_SIZE} MB`,
              },
            },
            {
              property: 'description',
              constraints: {
                isEmail: `Description must not exceed ${POST_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} symbols`,
              },
            },
          ],
        },
      },
    }),
  );
}
