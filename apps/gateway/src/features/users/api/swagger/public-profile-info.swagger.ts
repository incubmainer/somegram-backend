import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export function PublicProfileInfoSwagger() {
  return applyDecorators(
    ApiTags('Public-Users'),
    ApiOperation({ summary: 'Get public profile info for user by id' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Getting Profile successfully',
      schema: {
        example: {
          userName: 'john_doe',
          about: 'Software Developer',
          avatar: {
            url: 'http://serveroleg.ru:9000/somegram/users/ebe62aee-df7d-4621-9623-96aa9553a034/avatars/12279520-9dc6-44d1-bebd-e66fc2d4efc2.jpeg',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Transaction error',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Profile not found',
    }),
  );
}
