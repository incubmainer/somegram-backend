import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransformToNumber, Trim } from '@app/decorators';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { SortDirection } from '../../../../../common/domain/query.types';

enum GetCommentSortFiledEnum {
  createdAt = 'createdAt',
}

export class GetCommentsForPostQueryDto {
  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Trim()
  @TransformToNumber()
  @IsNumber()
  @IsNotEmpty()
  pageSize: number = 10;

  @ApiPropertyOptional({
    enum: GetCommentSortFiledEnum,
    default: GetCommentSortFiledEnum.createdAt,
  })
  sortBy: GetCommentSortFiledEnum = GetCommentSortFiledEnum.createdAt;

  @ApiPropertyOptional({ enum: SortDirection, default: SortDirection.DESC })
  sortDirection: SortDirection = SortDirection.DESC;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Trim()
  @TransformToNumber()
  @IsNumber()
  @IsNotEmpty()
  pageNumber: number = 1;
}
