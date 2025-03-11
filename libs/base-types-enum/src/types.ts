import { ApiProperty } from '@nestjs/swagger';
import { AppNotificationResultEnum } from '@app/application-notification';

type ConstraintErrorType = { [key: string]: string };

export class UnprocessableExceptionErrorDto {
  @ApiProperty({
    description: 'Property name',
    example: 'name',
    type: String,
  })
  property: string;
  @ApiProperty({
    description: 'Validation constraints and their error messages',
    example: {
      isNameLength: 'Length must be 10 symbols',
    },
    type: Object,
    additionalProperties: {
      type: 'string',
    },
  })
  constraints: ConstraintErrorType;
}
export class UnprocessableExceptionDto {
  @ApiProperty({
    description: 'Status code',
    example: 422,
    type: Number,
  })
  statusCode: number;
  @ApiProperty({
    description: 'Error message',
    example: 'Validation failed',
    type: String,
  })
  message: string;
  @ApiProperty({
    isArray: true,
    type: UnprocessableExceptionErrorDto,
  })
  errors: UnprocessableExceptionErrorDto[];
}

export class BadRequestExceptionDto {
  @ApiProperty({
    description: 'Status code',
    example: 400,
    type: Number,
  })
  status: number;
  @ApiProperty({
    description: 'Error',
    example: 'Bad request',
    type: String,
  })
  error: string;
  @ApiProperty({
    description: 'Error message',
    example: 'Username is already taken.',
    type: String,
  })
  message: string;
}

export class WsResponseDto<T = null> {
  @ApiProperty({
    description: 'Event message',
    example: 'Some message',
    type: String,
  })
  message: string;
  @ApiProperty({
    description: 'Status of request',
    example: AppNotificationResultEnum.Success,
    enum: AppNotificationResultEnum,
  })
  status: AppNotificationResultEnum;
  payload: T;
}
