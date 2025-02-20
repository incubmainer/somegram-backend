import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function LogOutSwagger() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Logout current user. In cookie client must send correct refreshToken that will be revoked',
    }),
    ApiCookieAuth(),
    ApiNoContentResponse({
      description: 'Success',
    }),
    ApiUnauthorizedResponse({
      description: 'Token expired, user or user device not found',
    }),
  );
}
