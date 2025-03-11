import { ApiProperty } from '@nestjs/swagger';

export class LoginOutputDto {
  @ApiProperty()
  accessToken: string;
}
