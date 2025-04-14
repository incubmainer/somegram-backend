import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';

import { QueryStringInput } from '../../common/query-string-input.model';

export enum AdminCommentSortByEnum {
  createdAt = 'createdAt',
}

@InputType()
export class CommentsQueryStringInput extends QueryStringInput {
  @IsOptional()
  @IsEnum(AdminCommentSortByEnum)
  @Field(() => String, {
    defaultValue: AdminCommentSortByEnum.createdAt,
  })
  sortBy: AdminCommentSortByEnum = AdminCommentSortByEnum.createdAt;
}
