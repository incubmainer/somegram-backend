import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class RestorePasswordBodyInputDto {
  @ApiProperty({
    type: String,
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  public email: string;

  @ApiProperty({
    type: String,
    description: 'Recaptcha token for verification',
    example: '03AGdBq24lGzj1_uP6S2...',
  })
  @IsString()
  public recaptchaToken: string;

  @ApiProperty({
    type: String,
    description: 'this is html of email. Params: ##name##, ##code##',
    example:
      '<b>Hello, ##name##!</b><br/>Please restore you password by clicking on the link below:<br/><a href="http://localhost:3000/restore-password/##code##">Restore password</a>. If it doesn\'t work, copy and paste the following link in your browser:<br/>http://localhost:3000/confirm-email/##code##',
  })
  @IsString()
  public html: string;
}
