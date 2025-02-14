import {
  SearchQueryParametersType,
  SortDirection,
} from '../domain/query.types';

const defaultSearchQueryParameters = {
  pageNumber: 1,
  pageSize: 8,
  maxPageSize: 100,
  sortBy: 'createdAt',
  sortDirection: 'desc' as SortDirection,
};

export const getSanitizationQuery = (
  query?: SearchQueryParametersType,
): SearchQueryParametersType => {
  return {
    pageNumber: !isNaN(query && query.pageNumber)
      ? +query.pageNumber
      : defaultSearchQueryParameters.pageNumber,
    pageSize:
      !isNaN(query && query.pageSize) ||
      (query && query.pageSize <= defaultSearchQueryParameters.maxPageSize)
        ? +query.pageSize
        : defaultSearchQueryParameters.pageSize,
    sortBy: query?.sortBy ? query.sortBy : defaultSearchQueryParameters.sortBy,
    sortDirection:
      query?.sortDirection && query.sortDirection.toLowerCase() === 'asc'
        ? ('asc' as SortDirection)
        : defaultSearchQueryParameters.sortDirection,
  };
};
