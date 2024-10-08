import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';

export function GetPostsSwagger() {
  return applyDecorators(
    ApiTags('Posts'),
    ApiOperation({ summary: 'Get user posts' }),
    ApiQuery({
      name: 'pageNumber',
      required: false,
      description: 'Page number',
      type: Number,
      example: 1,
    }),
    ApiQuery({
      name: 'pageSize',
      required: false,
      description: 'Number of items per page',
      type: Number,
      example: 8,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Getting successful',
      schema: {
        example: {
          page: 1,
          pageSize: 8,
          totalCount: 1,
          pagesCount: 1,
          items: [
            {
              id: '6c7baa2a-bac4-4eca-a2de-491353ad0ab2',
              description: 'string233333333333333',
              createdAt: '2024-10-08T08:34:36.573Z',
              updatedAt: '2024-10-08T08:36:27.891Z',
              images: [
                'http://serveroleg.ru:9000/somegram/users/d207dc73-8002-4804-a6d2-037b786eb568/posts/68dda9be-df33-4628-9b8d-c25b10ed7511.png',
              ],
              postOwnerInfo: {
                userId: 'd207dc73-8002-4804-a6d2-037b786eb568',
                username: 'valek007943',
                avatarUrl:
                  'http://serveroleg.ru:9000/somegram/users/d207dc73-8002-4804-a6d2-037b786eb568/avatars/66841f84-cec2-4ea8-a3fd-661f74dca54b.jpeg',
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
