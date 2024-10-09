export class Paginator<T> {
  public pagesCount: number;
  constructor(
    public page: number,
    public pageSize: number,
    public totalCount: number,
    public items: T,
  ) {
    this.pagesCount = Math.ceil(this.totalCount / this.pageSize);
  }
}
