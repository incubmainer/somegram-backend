import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

export function ProfileInfoSwagger() {
  return applyDecorators(
    ApiTags('Users'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Get Profile info' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Getting Profile successfully',
      schema: {
        example: {
          userName: 'john_doe',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john_doe@getMaxListeners.com',
          dateOfBirth: '1990-01-01',
          city: 'New York',
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
      status: HttpStatus.UNAUTHORIZED,
      description: 'User not found or not authorized',
    }),
  );
}
