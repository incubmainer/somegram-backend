import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiNoContentResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

export function DeleteAvatarSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete user avatar' }),
    ApiNoContentResponse({
      description: 'Success deleted avatar',
    }),
    ApiNotFoundResponse({ description: 'User not found' }),
  );
}
