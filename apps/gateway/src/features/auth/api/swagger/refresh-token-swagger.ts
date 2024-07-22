import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export function RefreshTokenSwagger() {
  return applyDecorators(
    ApiTags('auth'),
    ApiOperation({
      summary:
        'Generate new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing) ',
    }),
    ApiResponse({
      status: 200,
      description:
        'Returns JWT accessToken in body and JWT refreshToken in cookie.',
      schema: {
        example: {
          accessToken: 'asdoifja3rfjl312r.aoifj23fl.jlwoif',
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorised',
    }),
  );
}
