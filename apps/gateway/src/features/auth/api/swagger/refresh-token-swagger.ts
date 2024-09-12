import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export function RefreshTokenSwagger() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({
      summary:
        'Generate new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing) ',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description:
        'Returns JWT accessToken in body and JWT refreshToken in cookie.',
      schema: {
        example: {
          accessToken: 'asdoifja3rfjl312r.aoifj23fl.jlwoif',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorised',
    }),
  );
}
