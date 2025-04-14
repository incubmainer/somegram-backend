import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { BadRequestExceptionDto } from '../../../../../../../libs/base-types-enum/src/types';

export function DeleteFollowerSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete follower' }),
    ApiNoContentResponse({
      description: 'Success',
    }),
    ApiNotFoundResponse({
      description: 'User not found',
    }),
    ApiBadRequestResponse({
      description: 'Bad request, if the user try delete myself',
      type: BadRequestExceptionDto,
    }),
  );
}
