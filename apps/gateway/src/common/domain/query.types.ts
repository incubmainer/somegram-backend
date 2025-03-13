import { registerEnumType } from '@nestjs/graphql';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export type SearchQueryParametersType = {
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirection;
  pageNumber: number;
  search?: string;
};

registerEnumType(SortDirection, {
  name: 'SortDirection',
});
