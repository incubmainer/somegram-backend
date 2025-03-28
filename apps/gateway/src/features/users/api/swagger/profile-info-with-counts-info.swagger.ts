import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ProfileInfoWithCountsInfosOutputDtoModel } from '../dto/output-dto/profile-info-output-dto';

export function ProfileInfoWithCountsInfoSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get profile info with  posts count and followee/wers counts',
    }),
    ApiNotFoundResponse({
      description: 'User not found',
    }),
    ApiOkResponse({
      description: 'Success',
      type: ProfileInfoWithCountsInfosOutputDtoModel,
    }),
  );
}
