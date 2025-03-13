import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { UnprocessableExceptionDto } from '@app/base-types-enum';
import { LoginOutputDto } from '../dto/output-dto/login-outptu.dto';

export function LoginSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'User Login' }),
    ApiOkResponse({
      description: `Login successful. The refreshToken is set in an HTTP-only cookie.`,
      type: LoginOutputDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Wrong email or password or user not confirmed',
    }),
    ApiUnprocessableEntityResponse({
      description: 'Validation error',
      type: UnprocessableExceptionDto,
    }),
  );
}
