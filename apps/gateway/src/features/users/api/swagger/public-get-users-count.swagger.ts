import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { UserCountOutputDto } from '../dto/output-dto/profile-info-output-dto';

export function PublicGetUsersCountSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get total count registered users in app' }),
    ApiOkResponse({
      description: 'Success',
      type: UserCountOutputDto,
    }),
  );
}
