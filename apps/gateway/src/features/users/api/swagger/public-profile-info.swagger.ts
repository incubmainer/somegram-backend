import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ProfilePublicInfoOutputDtoModel } from '../dto/output-dto/profile-info-output-dto';

export function PublicProfileInfoSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get public profile info for user by id' }),
    ApiOkResponse({
      description: 'Success',
      type: ProfilePublicInfoOutputDtoModel,
    }),
    ApiNotFoundResponse({
      description: 'User not found',
    }),
  );
}
