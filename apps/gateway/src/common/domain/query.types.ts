import { registerEnumType } from '@nestjs/graphql';
import { IsOptional, Max, Min, IsString, IsEnum } from 'class-validator';
import { TransformToNumber, Trim } from '../../../../../libs/decorators/src';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

const QUERY_PARAMETERS = {
  pageNumber: 1,
  pageSize: 8,
  maxPageSize: 100,
  sortBy: 'createdAt',
  sortDirection: 'desc' as SortDirection,
};

export class SearchQueryParametersWithoutSorting {
  @TransformToNumber()
  @Min(QUERY_PARAMETERS.pageNumber, {
    message: `Page size must be greater than or equal to ${QUERY_PARAMETERS.pageNumber}`,
  })
  @Max(QUERY_PARAMETERS.maxPageSize, {
    message: `Page size must be less than or equal to ${QUERY_PARAMETERS.maxPageSize}`,
  })
  pageSize: number = QUERY_PARAMETERS.pageSize;

  @TransformToNumber()
  pageNumber: number = QUERY_PARAMETERS.pageNumber;

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
