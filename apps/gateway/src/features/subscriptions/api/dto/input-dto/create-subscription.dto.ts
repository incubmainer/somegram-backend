import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import {
  SubscriptionType,
  PaymentSystem,
} from '../../../../../../../../libs/common/enums/payments';

export class CreateSubscriptionDto {
  @ApiProperty({
    type: String,
    required: true,
    enum: SubscriptionType,
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(SubscriptionType)
  subscriptionType: string;

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
