import { ApiProperty } from '@nestjs/swagger';
import { IsUserEmail } from '../../../application/decorators/is-user-email';
import { IsUserPassword } from '../../../application/decorators/is-user-password';
import { IsUsername } from '../../../application/decorators/is-username';

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
}
