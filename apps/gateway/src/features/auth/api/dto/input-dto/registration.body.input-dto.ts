import { ApiProperty } from '@nestjs/swagger';
import { IsUserEmail } from '../../../application/decorators/is-user-email';
import { IsUserPassword } from '../../../application/decorators/is-user-password';
import { IsUsername } from '../../../application/decorators/is-username';
import { IsString } from 'class-validator';

export class RegistrationBodyInputDto {
  @ApiProperty({
    type: String,
    description: 'this is name of user',
    example: 'Rayan_Ghosling',
    pattern: '^[0-9A-Za-z_-]+$',
    minLength: 6,
    maxLength: 30,
  })
  @IsUsername()
  username: string;
  @ApiProperty({
    type: String,
    description: 'this is email of user',
    example: 'some@mail.com',
  })
  @IsUserEmail()
  email: string;
  @ApiProperty({
    type: String,
    description:
      'this is password of user. Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    example: 'Password_123',
    minLength: 6,
    maxLength: 20,
  })
  @IsUserPassword()
  password: string;
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
