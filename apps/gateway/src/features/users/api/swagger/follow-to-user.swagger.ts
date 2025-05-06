import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { BadRequestExceptionDto } from '../../../../../../../libs/base-types-enum/src/types';

export function FollowToUserSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Follow to user' }),
    ApiNoContentResponse({
      description: 'Success',
    }),
    ApiNotFoundResponse({
      description: 'User not found',
    }),
    ApiBadRequestResponse({
      description: 'Bad request, if the user try follow to myself',
      type: BadRequestExceptionDto,
    }),
  );
}
