import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ProfileInfoOutputDtoModel } from '../dto/output-dto/profile-info-output-dto';

export function ProfileInfoSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get Profile info' }),
    ApiOkResponse({ description: 'Success', type: ProfileInfoOutputDtoModel }),
  );
}
