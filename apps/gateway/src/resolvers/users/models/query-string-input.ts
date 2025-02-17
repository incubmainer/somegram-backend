import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { SortDirection } from '../../../common/domain/query.types';

@InputType()
export class QueryStringInput {
  @Min(1, { message: 'Page must be greater than or equal to 1' })
  @Field(() => Int, { defaultValue: 1 })
  pageNumber: number = 1;

  @Min(1, { message: 'Page size must be greater than or equal to 1' })
  @Max(8, { message: 'Page size must be less than or equal to 8' })
  @Field(() => Int, { defaultValue: 8 })
  pageSize: number = 8;

  @IsString()
  @IsIn(['username', 'email', 'createdAt'], {
    message:
      'sortBy must be one of the following values: username, email, createdAt',
  })
  @Field(() => String, { defaultValue: 'username' })
  sortBy: string = 'username';

  @IsEnum(SortDirection, {
    message: 'sortOrder must be either ASC or DESC',
  })
  @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
  sortDirection: SortDirection = SortDirection.ASC;

  @MaxLength(30, { message: 'Size must be less than or equal to 30' })
  @IsOptional()
  @Field(() => String, { nullable: true })
  search?: string;
}
