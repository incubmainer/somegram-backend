import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export function GetInfoAboutMeSwagger() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({ summary: 'Get info about user' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns user information',
      schema: {
        example: {
          userId: '123',
          userName: 'John Doe',
          email: 'john.doe@example.com',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'JWT token inside cookie missed, expired or incorrect',
      schema: {
        example: {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorised',
        },
      },
    }),
  );
}
