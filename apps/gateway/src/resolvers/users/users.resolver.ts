import { NotFoundException, UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { BasicGqlGuard } from '../../common/guards/graphql/basic-gql.guard';
import { PaginatedUserModel } from './models/paginated-user.model';
import { UsersService } from '../../features/users/application/users.service';
import { UserModel } from './models/user.model';
import { BanUserInput } from './models/ban-user-input';
import { QueryStringInput } from './models/pagination-users-input';
import { FileModel } from './models/file-model';
import { UserAvatarsLoader } from '../../common/data-loaders/user-avatars-loader';
import { PostsPhotosLoader } from '../../common/data-loaders/posts-photos-loader';
import { PaymentsModel } from '../payments/models/subscription.payments.model';
import { PaymentsLoader } from '../../common/data-loaders/payments-loader';

@Resolver(() => UserModel)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly userImagesLoader: UserAvatarsLoader,
    private readonly postsPhotosLoader: PostsPhotosLoader,
    private readonly paymentsLoader: PaymentsLoader,
  ) {}

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

  @ResolveField(() => FileModel, { nullable: true })
  async getAvatar(@Parent() user: UserModel) {
    return await this.userImagesLoader.generateDataLoader().load(user.id);
  }

  @ResolveField(() => [FileModel], { nullable: true })
  async getPostsPhotos(@Parent() user: UserModel) {
    return await this.postsPhotosLoader.generateDataLoader().load(user.id);
  }

  @ResolveField(() => [PaymentsModel], { nullable: true })
  async getPayments(@Parent() user: UserModel) {
    return await this.paymentsLoader.generateDataLoader().load(user.id);
  }
}
