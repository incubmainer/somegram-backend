export type SortDirection = 'asc' | 'desc';
export type SearchQueryParametersType = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirection;
};
