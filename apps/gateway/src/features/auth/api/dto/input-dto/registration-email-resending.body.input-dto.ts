import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegistrationEmailResendingBodyInputDto {
  @ApiProperty({
    type: String,
    description: "It's confirmation token",
    example: 'hlMdq0ghJbmujPQ+adSo+qX6aP0=',
  })
  @IsString()
  token: string;
  @ApiProperty({
    type: String,
    description:
      'this is html of email. Params: ##name##, ##token##, ##expiredAt##',
    example:
      '<b>Hello, ##name##!</b><br/>Please confirm your email by clicking on the link below:<br/><a href="http://localhost:3000/confirm-email/##token##">Confirm email</a>. If it doesn\'t work, copy and paste the following link in your browser:<br/>http://localhost:3000/confirm-email/##token##',
  })
  @IsString()
  html: string;
}
