import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '@app/decorators';

export class RegistrationConfirmationBodyInputDto {
  @ApiProperty({
    type: String,
    description: "It's confirmation token",
    example: 'hlMdq0ghJbmujPQ+adSo+qX6aP0=',
  })
  @Trim()
  @IsNotEmpty()
  @IsString()
  token: string;
}
