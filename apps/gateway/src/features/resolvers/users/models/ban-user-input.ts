import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsUUID, Matches, MaxLength } from 'class-validator';

@InputType()
export class BanUserInput {
  @MaxLength(50, { message: 'Maximum number of characters 50' })
  @Matches(/^[A-Za-zА-Яа-яЁё\s]*$/, {
    message: 'The banReason must contain A-Z a-z А-Я а-я',
  })
  @IsString()
  @Field(() => String)
  banReason: string;

  @IsUUID()
  @Field(() => String)
  userId: string;
}
