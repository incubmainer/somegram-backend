import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { LoginInput } from './models/login-input.model';
import { AuthGqlBasicGuard } from '../../../common/guards/graphql/auth-gql-basic.guard';
import { BasicGqlGuard } from '../../../common/guards/graphql/basic-gql.guard';

@Resolver()
export class AuthResolver {
  constructor() {}

  @Query(() => String)
  @UseGuards(BasicGqlGuard)
  loginSa(): string {
    return 'Authorized user';
  }

  @Mutation(() => String)
  @UseGuards(AuthGqlBasicGuard)
  async authorizeSuperAdmin(@Args('loginInput') loginInput: LoginInput) {
    const authString = `${loginInput.email}:${loginInput.password}`;
    const base64AuthString = Buffer.from(authString).toString('base64');
    return `Basic ${base64AuthString}`;
  }
}
