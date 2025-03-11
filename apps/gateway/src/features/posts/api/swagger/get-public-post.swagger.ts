import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { PostOutputDtoModel } from '../dto/output-dto/post.output-dto';

export function GetPublicPostSwagger() {
  return applyDecorators(
    ApiTags('Public-Posts'),
    ApiOperation({ summary: 'Get public post by id' }),
    ApiOkResponse({ description: 'Success', type: PostOutputDtoModel }),
    ApiNotFoundResponse({
      description: 'Post not found',
    }),
  );
}
