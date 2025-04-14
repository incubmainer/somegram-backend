import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BadRequestExceptionDto } from '@app/base-types-enum';

export function GithubAuthCallbackSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'GitHub Authentication Callback' }),
    ApiOkResponse({
      description: `Login successful.
Redirect to home page. ({homePage}/?accessToken={accessToken})
The refreshToken is set in an HTTP-only cookie.
The accessToken set to the query parameter.`,
    }),
    ApiBadRequestResponse({
      description: 'Unknown IP address or useragent',
      type: BadRequestExceptionDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}
