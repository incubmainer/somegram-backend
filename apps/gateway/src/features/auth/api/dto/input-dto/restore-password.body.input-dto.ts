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
}
