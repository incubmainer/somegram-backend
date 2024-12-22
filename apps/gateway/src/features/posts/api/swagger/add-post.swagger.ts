import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { PostOutputDtoModel } from '../dto/output-dto/post.output-dto';
import { UnprocessableExceptionDto } from '@app/base-types-enum';

export function AddPostSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Add user post' }),
    ApiBearerAuth('access-token'),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      type: 'multipart/form-data',
      required: true,
      schema: {
        type: 'object',
        required: ['files'],
        properties: {
          files: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
          description: {
            type: 'string',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Success',
      type: PostOutputDtoModel,
    }),
    ApiUnprocessableEntityResponse({
      type: UnprocessableExceptionDto,
      description: 'Validation failed',
    }),
  );
}
