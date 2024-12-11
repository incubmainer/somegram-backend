import { Test, TestingModule } from '@nestjs/testing';
import { Pagination, PaginatorService } from './paginator.service';

type PaginationDataType = {
  name: string;
  age: number;
  isMarried: boolean;
};
describe('PaginatorService', () => {
  let service: PaginatorService;
  const data: PaginationDataType[] = [];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaginatorService],
    }).compile();

    service = module.get<PaginatorService>(PaginatorService);

    data.length = 0;
  });

  const createData = () => {
    for (let i = 0; i < 10; i++) {
      data.push({
        name: `Name${i}`,
        age: i + 20,
        isMarried: i % 2 === 0,
      });
    }
  };
  it('should create pagination', () => {
    createData();
    const res: Pagination<PaginationDataType[]> = service.create(10, 10, data);

    expect(res.items).toHaveLength(10);
    expect(res).toEqual({
      pagesCount: 1,
      pageSize: 10,
      totalCount: 10,
      items: data,
    });
  });

  it('should handle empty data gracefully', () => {
    const res: Pagination<PaginationDataType[]> = service.create(10, 0, []);

    expect(res.items).toHaveLength(0);
    expect(res).toEqual({
      pagesCount: 0,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it('should handle fractional pages correctly', () => {
    createData();
    const res: Pagination<PaginationDataType[]> = service.create(
      3,
      10,
      data.slice(0, 3),
    );

    expect(res.pagesCount).toBe(4); // 10 elements, 3 per page = 4 pages
    expect(res.pageSize).toBe(3);
    expect(res.totalCount).toBe(10);
    expect(res.items).toHaveLength(3);
  });

  it('should extend the class and return new information', () => {
    createData();

    class PaginationUser<T = []> extends Pagination<T> {
      // New property
      public currentPage: number;
    }

    // Inject into the module as a dependency
    class PaginatorUserService extends PaginatorService {
      createUserPagination<T = []>(
        pageSize: number,
        totalCount: number,
        currentPage: number,
        items: T,
      ): PaginationUser<T> {
        return {
          ...super.create(pageSize, totalCount, items),
          currentPage: currentPage,
        };
      }
    }

    const userService = new PaginatorUserService();
    const res: PaginationUser<PaginationDataType[]> =
      userService.createUserPagination(10, 10, 1, data);

    expect(res.items).toHaveLength(10);
    expect(res).toEqual({
      pagesCount: 1,
      pageSize: 10,
      totalCount: 10,
      currentPage: 1,
      items: data,
    });
  });

  it('should work with different types of data', () => {
    const numericData = [1, 2];
    const res: Pagination<number[]> = service.create(2, 5, numericData);

    expect(res.items).toHaveLength(2);
    expect(res).toEqual({
      pagesCount: 3,
      pageSize: 2,
      totalCount: 5,
      items: numericData,
    });
  });
});
