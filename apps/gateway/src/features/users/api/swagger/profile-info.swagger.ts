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
          dateOfBirth: '1990-01-01',
          city: 'New York',
          about: 'Software Developer',
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
