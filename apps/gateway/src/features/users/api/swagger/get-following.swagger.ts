import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiOkResponse,
} from '@nestjs/swagger';
import { SearchFollowingProfileOutputDtoWithPaginationModel } from '../dto/output-dto/profile-info-output-dto';

export function GetFollowingSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get following by user' }),
    ApiQuery({
      name: 'search',
      description: 'Search by username',
      required: false,
      type: String,
    }),
    ApiParam({
      name: 'endCursorUserId',
      required: false,
      description:
        'ID of the last user. If endCursorUserId not provided, the first set of users is returned.',
      type: String,
    }),
    ApiQuery({
      name: 'pageSize',
      required: false,
      description: 'Number of items per page',
      type: Number,
      example: 8,
    }),
    ApiQuery({
      name: 'pageNumber',
      required: false,
      description: 'Number of page',
      type: Number,
      example: 1,
    }),
    ApiOkResponse({
      description: 'Success',
      type: SearchFollowingProfileOutputDtoWithPaginationModel,
    }),
  );
}
