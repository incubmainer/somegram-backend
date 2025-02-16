import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

export function GetInfoAboutMeSwagger() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({ summary: 'Get info about user' }),
    ApiBearerAuth('access-token'),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns user information',
      schema: {
        example: {
          status: HttpStatus.OK,
          userId: '123',
          userName: 'John Doe',
          email: 'john.doe@example.com',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'JWT token inside cookie missed, expired or incorrect',
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Transaction error',
    }),
  );
}
