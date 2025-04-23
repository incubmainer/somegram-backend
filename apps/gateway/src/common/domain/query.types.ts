import { registerEnumType } from '@nestjs/graphql';
import { IsOptional, Max, Min, IsString, IsEnum } from 'class-validator';
import { TransformToNumber, Trim } from '../../../../../libs/decorators/src';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export const QUERY_PARAMETERS = {
  pageNumber: 1,
  pageSize: 8,
  maxPageSize: 100,
  sortBy: 'createdAt',
  sortDirection: 'desc' as SortDirection,
};

export class SearchQueryParametersWithoutSorting {
  @ApiProperty({
    minimum: QUERY_PARAMETERS.pageNumber,
    maximum: QUERY_PARAMETERS.maxPageSize,
    default: QUERY_PARAMETERS.pageNumber,
  })
  @TransformToNumber()
  @Min(QUERY_PARAMETERS.pageNumber, {
    message: `Page size must be greater than or equal to ${QUERY_PARAMETERS.pageNumber}`,
  })
  @Max(QUERY_PARAMETERS.maxPageSize, {
    message: `Page size must be less than or equal to ${QUERY_PARAMETERS.maxPageSize}`,
  })
  pageSize: number = QUERY_PARAMETERS.pageSize;

  @ApiProperty({ default: QUERY_PARAMETERS.pageNumber })
  @TransformToNumber()
  pageNumber: number = QUERY_PARAMETERS.pageNumber;

  @ApiPropertyOptional()
  @IsOptional()
  @Trim()
  @IsString()
  search?: string;
}

export class SearchQueryParameters extends SearchQueryParametersWithoutSorting {
  @IsOptional()
  sortBy: string = QUERY_PARAMETERS.sortBy;

  @IsEnum(SortDirection, {
    message: 'sortDirection must be either ASC or DESC',
  })
  sortDirection: SortDirection = SortDirection.DESC;
}

registerEnumType(SortDirection, {
  name: 'SortDirection',
});
