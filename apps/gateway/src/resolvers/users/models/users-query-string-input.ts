import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { UserBlockStatus } from '../../../../../../libs/common/enums/user-block-status.enum';
import { QueryStringInput } from '../../common/query-string-input.model';

@InputType()
export class UsersQueryStringInput extends QueryStringInput {
  @IsEnum(UserBlockStatus, {
    message: 'statusFilter must be either all or blocked or unblocked',
  })
  @Field(() => UserBlockStatus, { defaultValue: UserBlockStatus.ALL })
  statusFilter: UserBlockStatus;

  @MaxLength(30, { message: 'Size must be less than or equal to 30' })
  @IsOptional()
  @Field(() => String, { nullable: true })
  search?: string;

  @IsString()
  @IsIn(['username', 'email', 'createdAt'], {
    message:
      'sortBy must be one of the following values: username, email, createdAt',
  })
  @Field(() => String, { defaultValue: 'username' })
  sortBy: string = 'username';
}
