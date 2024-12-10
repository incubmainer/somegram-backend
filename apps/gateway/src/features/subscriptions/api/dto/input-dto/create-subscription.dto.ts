import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import {
  PaymentTime,
  PaymentSystem,
} from '../../../../../../../../libs/common/enums/payments';

export class CreateSubscriptionDto {
  @ApiProperty({
    type: String,
    required: true,
    enum: PaymentTime,
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(PaymentTime)
  typeSubscription: string;

  @ApiProperty({
    type: String,
    required: true,
    enum: PaymentSystem,
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(PaymentSystem)
  paymentSystem: string;
}
