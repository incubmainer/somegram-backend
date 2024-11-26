import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
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

  // @ApiProperty({
  //   description: 'The number of payments must be a positive integer',
  //   type: Number,
  //   required: true,
  // })
  // @IsNotEmpty()
  // @IsInt()
  // @Min(0)
  // paymentCount: number;

  // @ApiProperty({
  //   description: 'Default value false',
  //   type: Boolean,
  //   required: false,
  //   default: false,
  // })
  // @IsOptional()
  // @IsBoolean()
  // autoRenewal: boolean;
}
