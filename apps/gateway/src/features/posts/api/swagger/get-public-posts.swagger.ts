import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiOkResponse,
} from '@nestjs/swagger';
import { PostOutputDtoWithPaginationModel } from '../dto/output-dto/post.output-dto';

export function GetPublicPostsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get public posts' }),
    ApiParam({
      name: 'endCursorPostId',
      required: false,
      description:
        'ID of the last uploaded post. If endCursorPostId not provided, the first set of posts is returned.',
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
      name: 'sortBy',
      required: false,
      description:
        'Sort by parameters. Available values: createdAt, updatedAt. Default value: createdAt',
      type: String,
      example: 'createdAt',
    }),
    ApiQuery({
      name: 'sortDirection',
      required: false,
      description: 'Sort by desc or asc. Default value: desc',
      type: String,
      enum: ['asc', 'desc'],
      example: 'desc',
    }),
    ApiOkResponse({
      description: 'Success',
      type: PostOutputDtoWithPaginationModel,
    }),
  );
}
