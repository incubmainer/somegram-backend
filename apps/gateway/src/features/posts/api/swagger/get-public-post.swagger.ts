import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export function GetPublicPostSwagger() {
  return applyDecorators(
    ApiTags('Public-Posts'),
    ApiOperation({ summary: 'Get public post by id' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Getting successful',
      schema: {
        example: {
          id: '6c7baa2a-bac4-4eca-a2de-491353ad0ab2',
          description: 'string233333333333333',
          createdAt: '2024-10-08T08:34:36.573Z',
          updatedAt: '2024-10-08T08:36:27.891Z',
          images: [
            'http://serveroleg.ru:9000/somegram/users/d207dc73-8002-4804-a6d2-037b786eb568/posts/68dda9be-df33-4628-9b8d-c25b10ed7511.png',
          ],
          postOwnerInfo: {
            userId: 'd207dc73-8002-4804-a6d2-037b786eb568',
            username: 'john_dou',
            firstName: 'John',
            lastName: 'Doue',
            avatarUrl:
              'http://serveroleg.ru:9000/somegram/users/d207dc73-8002-4804-a6d2-037b786eb568/avatars/66841f84-cec2-4ea8-a3fd-661f74dca54b.jpeg',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Post not found',
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Transaction error',
    }),
  );
}
