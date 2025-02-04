import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '@app/decorators';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationInputDto {
  public userId: string;
  public message: string;
}

export class MarkNotificationAsReadInputDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Notification id',
    type: String,
    required: true,
  })
  public notificationId: string;
}
