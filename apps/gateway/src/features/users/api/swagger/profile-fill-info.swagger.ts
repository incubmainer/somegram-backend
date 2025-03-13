import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiBadRequestResponse,
  ApiUnprocessableEntityResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  BadRequestExceptionDto,
  UnprocessableExceptionDto,
} from '@app/base-types-enum';
import { ProfileInfoOutputDtoModel } from '../dto/output-dto/profile-info-output-dto';

export function ProfileFillInfoSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Fill User Profile' }),
    ApiOkResponse({
      description: 'Profile filled successfully',
      type: ProfileInfoOutputDtoModel,
    }),
    ApiUnprocessableEntityResponse({
      description: 'Validation failed',
      type: UnprocessableExceptionDto,
    }),
    ApiBadRequestResponse({
      description:
        'Bad request, if the current username belongs to another user',
      type: BadRequestExceptionDto,
    }),
  );
}
