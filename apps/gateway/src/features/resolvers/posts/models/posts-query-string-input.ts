import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional, MaxLength } from 'class-validator';

import { QueryStringInput } from '../../common/query-string-input.model';

export enum AdminPostsSortByEnum {
  username = 'username',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}

@InputType()
export class PostsQueryStringInput extends QueryStringInput {
  @MaxLength(30, { message: 'Size must be less than or equal to 30' })
  @IsOptional()
  @Field(() => String, { nullable: true })
  searchByUsername?: string;

  @IsOptional()
  @IsEnum(AdminPostsSortByEnum)
  @Field(() => String, {
    defaultValue: AdminPostsSortByEnum.createdAt,
  })
  sortBy: AdminPostsSortByEnum = AdminPostsSortByEnum.createdAt;
}
