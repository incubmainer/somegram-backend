import { Field, InputType } from '@nestjs/graphql';
import { IsIn, IsString } from 'class-validator';

import { QueryStringInput } from '../../common/query-string-input.model';

export enum FollowSortValues {
  Username = 'username',
  CreatedAt = 'createdAt',
}

@InputType()
export class FollowQueryStringInput extends QueryStringInput {
  @IsString()
  @IsIn(Object.values(FollowSortValues), {
    message: 'sortBy must be one of the following values: username, createdAt',
  })
  @Field(() => String, { defaultValue: FollowSortValues.Username })
  sortBy: string = FollowSortValues.Username;
}
