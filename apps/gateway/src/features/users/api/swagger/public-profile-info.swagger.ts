import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ProfilePublicInfoWithAboutOutputDtoModel } from '../dto/output-dto/profile-info-output-dto';

export function PublicProfileInfoSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get public profile info for user by id' }),
    ApiOkResponse({
      description: 'Success',
      type: ProfilePublicInfoWithAboutOutputDtoModel,
    }),
    ApiNotFoundResponse({
      description: 'User not found',
    }),
  );
}
