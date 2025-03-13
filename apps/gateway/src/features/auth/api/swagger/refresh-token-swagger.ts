import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginOutputDto } from '../dto/output-dto/login-outptu.dto';

export function RefreshTokenSwagger() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Generate new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing) ',
    }),
    ApiCookieAuth(),
    ApiOkResponse({
      description:
        'Returns JWT accessToken in body and JWT refreshToken in cookie.',
      type: LoginOutputDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Token expired, user or user device not found',
    }),
  );
}
