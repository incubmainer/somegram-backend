import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { BasicGqlGuard } from '../../common/guards/graphql/basic-gql.guard';
import { PaginatedUserModel } from './models/paginated-user.model';
import { SortDirection } from '../../common/domain/query.types';
import { UsersService } from '../../features/users/application/users.service';
import { UserModel } from './models/user.model';

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
    @Args('pageNumber', { nullable: true, defaultValue: 1 })
    pageNumber?: number,
    @Args('pageSize', { nullable: true, defaultValue: 8 }) pageSize?: number,
    @Args('sortBy', { nullable: true, defaultValue: 'username' })
    sortBy?: string,
    @Args('sortDirection', {
      type: () => SortDirection,
      defaultValue: 'desc' as SortDirection,
    })
    sortDirection?: SortDirection,
    @Args('search', { nullable: true }) search?: string,
  ): Promise<PaginatedUserModel> {
    return await this.usersService.getUsers({
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      search,
    });
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
}
