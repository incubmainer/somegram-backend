import { IsString } from 'class-validator';
import { IsUserPassword } from '../../../application/decorators/is-user-password';
import { ApiProperty } from '@nestjs/swagger';

export class RestorePasswordConfirmationBodyInputDto {
  @ApiProperty({
    example: 'akllasjdfR3lasdfl',
    description: 'Restore password code',
  })
  @IsString()
  code: string;
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
