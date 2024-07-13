import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export function LogOutSwagger() {
  return applyDecorators(
    ApiTags('auth'),
    ApiOperation({
      summary:
        'In cookie client must send correct refreshToken that will be revoked',
    }),
    ApiResponse({
      status: 204,
      description: 'No content',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorised',
    }),
  );
}
