import { ApiProperty } from '@nestjs/swagger';
import { IsUserEmail } from '../../../application/decorators/is-user-email';
import { IsUserPassword } from '../../../application/decorators/is-user-password';

export class LoginDto {
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
    example: 'password',
    minLength: 6,
    maxLength: 20,
  })
  @IsUserPassword()
  password: string;
}

// export class DeviceDto {
//   deviceId: string;
//   ip: string;
//   title: string;
//   lastActiveDate: string;
//   userId: string;
// }
