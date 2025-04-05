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
    ApiOperation({
      summary: 'Get public post by id',
      description: `You can pass the \`refreshToken\` in the request to \`get the like status\` for each comment related to the \`currently authorized user\` or none like status if user not authorized. 
        \n Comments that belong to the current authorized are the first to be displayed.
      `,
    }),
    ApiOkResponse({ description: 'Success', type: PostOutputDtoModel }),
    ApiNotFoundResponse({
      description: 'Post not found',
    }),
  );
}
