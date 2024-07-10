import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegistrationConfirmationBodyInputDto {
  @ApiProperty({
    type: String,
    description: "It's confirmation token",
    example: 'hlMdq0ghJbmujPQ+adSo+qX6aP0=',
  })
  @IsString()
  token: string;
}
