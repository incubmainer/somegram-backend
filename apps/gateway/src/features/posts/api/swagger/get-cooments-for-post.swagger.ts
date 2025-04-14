import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CommentPostOutputDtoPaginationModel } from '../dto/output-dto/comment-post.output-dto';
import { UnprocessableExceptionDto } from '@app/base-types-enum';

export function GetCommentForPostSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get comments for post by post id',
      description: `You can pass the \`refreshToken\` in the request to \`get the like status\` for each comment related to the \`currently authorized user\` or none like status if user not authorized. 
        \n Comments that belong to the current authorized are the first to be displayed.
      `,
    }),
    ApiOkResponse({
      description: 'Success',
      type: CommentPostOutputDtoPaginationModel,
    }),
    ApiNotFoundResponse({ description: 'Post not found' }),
    ApiUnprocessableEntityResponse({
      type: UnprocessableExceptionDto,
      description: 'Validation failed',
    }),
  );
}
