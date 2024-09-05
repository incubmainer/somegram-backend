import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MeOutputDto } from '../dto/output-dto/me-output-dto';

export function GetInfoAboutMeSwagger() {
  return applyDecorators(
    ApiTags('auth'),
    ApiOperation({ summary: 'Get info about user' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns user information',
      //   type: MeOutputDto,
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
