import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export function LogOutSwagger() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({
      summary:
        'In cookie client must send correct refreshToken that will be revoked',
    }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'No content',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorised',
    }),
  );
}
