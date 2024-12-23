export type SortDirection = 'asc' | 'desc';
export type SearchQueryParametersType = {
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirection;
  pageNumber: number;
};
