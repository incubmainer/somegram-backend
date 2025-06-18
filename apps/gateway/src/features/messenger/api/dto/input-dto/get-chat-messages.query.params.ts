import { ApiProperty } from '@nestjs/swagger';
import { TransformToNumber } from '@app/decorators';
import { Max, Min } from 'class-validator';
import { QUERY_PARAMETERS } from '../../../../../common/domain/query.types';

export class GetChatMessagesQueryParams {
  @ApiProperty({
    minimum: QUERY_PARAMETERS.pageNumber,
    maximum: QUERY_PARAMETERS.maxPageSize,
    default: 10,
  })
  @TransformToNumber()
  @Min(QUERY_PARAMETERS.pageNumber, {
    message: `Page size must be greater than or equal to ${QUERY_PARAMETERS.pageNumber}`,
  })
  @Max(QUERY_PARAMETERS.maxPageSize, {
    message: `Page size must be less than or equal to ${QUERY_PARAMETERS.maxPageSize}`,
  })
  pageSize: number = 10;

  @ApiProperty({ default: QUERY_PARAMETERS.pageNumber })
  @TransformToNumber()
  pageNumber: number = QUERY_PARAMETERS.pageNumber;
}
