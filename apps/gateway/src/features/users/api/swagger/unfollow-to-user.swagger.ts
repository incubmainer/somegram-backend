import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { BadRequestExceptionDto } from '../../../../../../../libs/base-types-enum/src/types';

export function UnfollowToUserSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Unollow to user' }),
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
