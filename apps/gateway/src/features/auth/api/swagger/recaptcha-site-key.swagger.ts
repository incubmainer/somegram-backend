import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { RecaptchaSiteKeyOutputDto } from '../dto/output-dto/recaptcha-site-key-output.dto';

export function RecaptchaSiteKeySwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get the reCAPTCHA site key',
    }),
    ApiOkResponse({
      description: 'reCAPTCHA site key retrieved successfully',
      type: RecaptchaSiteKeyOutputDto,
    }),
  );
}
