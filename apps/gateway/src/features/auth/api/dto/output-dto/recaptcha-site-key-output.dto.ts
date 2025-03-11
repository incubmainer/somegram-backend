import { ApiProperty } from '@nestjs/swagger';

export class RecaptchaSiteKeyOutputDto {
  @ApiProperty()
  recaptchaSiteKey: string;
}
