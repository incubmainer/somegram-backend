import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export function RecaptchaSiteKeySwagger() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({
      summary: 'Get the reCAPTCHA site key',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'reCAPTCHA site key retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          recaptchaSiteKey: {
            type: 'string',
            example: 'your-site-key-here',
          },
        },
      },
    }),
  );
}
