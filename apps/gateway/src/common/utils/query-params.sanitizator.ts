import { SearchQueryParametersType } from '../domain/query.types';

const defaultSearchQueryParameters = {
  pageNumber: 1,
  pageSize: 8,
  maxPageSize: 100,
};

export const getSanitizationQuery = (
  query?: SearchQueryParametersType,
): SearchQueryParametersType => {
  return {
    pageNumber: !isNaN(query!.pageNumber!)
      ? +query!.pageNumber
      : defaultSearchQueryParameters.pageNumber,
    pageSize:
      !isNaN(query!.pageSize!) ||
      query!.pageSize! <= defaultSearchQueryParameters.maxPageSize
        ? +query!.pageSize
        : defaultSearchQueryParameters.pageSize,
  };
};
