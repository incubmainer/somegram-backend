import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { BadRequestExceptionDto } from '@app/base-types-enum';

export function GoogleAuthCallbackSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Google Authentication Callback' }),
    ApiOkResponse({
      description: `Login successful.
Redirect to home page. ({homePage}/?accessToken={accessToken})
The refreshToken is set in an HTTP-only cookie.
The accessToken set to the query parameter.`,
    }),
    ApiBadRequestResponse({
      description:
        'Login failed due to wrong email or ip or useragent not correct or not found',
      type: BadRequestExceptionDto,
    }),
  );
}
