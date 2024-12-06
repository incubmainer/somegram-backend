import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

// Like a type
export class Pagination<T = []> {
  @ApiProperty({
    description: 'Number of pages',
    example: 1,
    type: Number,
  })
  public pagesCount: number;
  @ApiProperty({
    description: 'Number of elements per page',
    example: 10,
    type: Number,
  })
  public pageSize: number;
  @ApiProperty({
    description: 'Total number of elements',
    example: 100,
    type: Number,
  })
  public totalCount: number;
  @ApiProperty({
    description: 'Array of elements',
  })
  public items: T;
}

@Injectable()
export class PaginatorService extends Pagination {
  public create<T = []>(
    pageSize: number,
    totalCount: number,
    items: T,
  ): Pagination<T> {
    return {
      pageSize: pageSize,
      totalCount: totalCount,
      pagesCount: Number(Math.ceil(totalCount / pageSize)),
      items: items,
    };
  }
}
