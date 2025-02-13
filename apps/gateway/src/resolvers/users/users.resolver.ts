import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { BasicGqlGuard } from '../../common/guards/graphql/basic-gql.guard';
import { PaginatedUserModel } from './models/paginated-user.model';
import { SortDirection } from '../../common/domain/query.types';
import { UsersService } from '../../features/users/application/users.service';
import { UserModel } from './models/user.model';
import { BanUserInput } from './models/ban-user-input';
import { QueryStringInput } from './models/pagination-users-input';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => UserModel, { nullable: true })
  @UseGuards(BasicGqlGuard)
  async getUser(@Args('id') id: string): Promise<UserModel> {
    const user = await this.usersService.getUser(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Query(() => PaginatedUserModel)
  @UseGuards(BasicGqlGuard)
  async getUsers(
    @Args('queryString', { type: () => QueryStringInput, nullable: true })
    queryString: QueryStringInput,
  ): Promise<PaginatedUserModel> {
    return await this.usersService.getUsers(queryString);
  }

  @Mutation(() => Boolean)
  @UseGuards(BasicGqlGuard)
  async deleteUser(
    @Args('userId', { type: () => String }) userId: string,
  ): Promise<boolean> {
    const res = await this.usersService.removeUser(userId);
    if (!res) {
      throw new NotFoundException('User not found');
    }
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(BasicGqlGuard)
  async banUser(
    @Args('banUserInput', { type: () => BanUserInput })
    banUserInput: BanUserInput,
  ): Promise<boolean> {
    const res = await this.usersService.banUser(banUserInput);
    if (!res) {
      throw new NotFoundException('User not found');
    }
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(BasicGqlGuard)
  async unbanUser(
    @Args('userId', { type: () => String }) userId: string,
  ): Promise<boolean> {
    const res = await this.usersService.unbanUser(userId);
    if (!res) {
      throw new NotFoundException('User not found');
    }
    return true;
  }
}
