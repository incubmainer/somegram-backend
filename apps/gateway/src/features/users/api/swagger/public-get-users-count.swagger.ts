import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export function PublicGetUsersCountSwagger() {
  return applyDecorators(
    ApiTags('Public-Users'),
    ApiOperation({ summary: 'Get total count registered users in app' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Getting Profile successfully',
      schema: {
        example: {
          totalCount: 0,
        },
      },
    }),
  );
}
