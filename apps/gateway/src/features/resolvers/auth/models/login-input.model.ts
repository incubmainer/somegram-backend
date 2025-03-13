import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

@InputType()
export class LoginInput {
  @IsEmail()
  @IsNotEmpty()
  @Field()
  email: string;

  @MinLength(8, {
    message: 'The password length must be at least 8 characters.',
  })
  @Matches(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])[0-9A-Za-z]+$/, {
    message: 'Password must contain 0-9, a-z, A-Z',
  })
  @IsNotEmpty()
  @Field()
  password: string;
}
