import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MeOutputDto } from '../dto/output-dto/me-output-dto';

export function GetInfoAboutMeSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get info about user' }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({
      description: 'Returns user information',
      type: MeOutputDto,
    }),
    ApiUnauthorizedResponse({
      description: 'JWT token inside cookie missed, expired or incorrect',
    }),
  );
}
