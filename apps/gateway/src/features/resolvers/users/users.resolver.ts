import {
  InternalServerErrorException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';

import { PaymentsLoader } from '../../../common/data-loaders/payments-loader';
import { PostsPhotosLoader } from '../../../common/data-loaders/posts-photos-loader';
import { UserAvatarsLoader } from '../../../common/data-loaders/user-avatars-loader';
import { BasicGqlGuard } from '../../../common/guards/graphql/basic-gql.guard';
import { GetUserQuery } from '../../users/application/queryBus/graphql/get-user.use-case';
import { GetUsersQuery } from '../../users/application/queryBus/graphql/get-users.use-case';
import { BanUserInput } from './models/ban-user-input';
import { FileModel } from './models/file-model';
import {
  PaginatedFollowerModel,
  PaginatedUserModel,
} from './models/paginated-user.model';
import { FollowerModel, UserModel } from './models/user.model';
import { UsersQueryStringInput } from './models/users-query-string-input';
import { BanUserCommand } from '../../users/application/use-cases/graphql/ban-user.use-case';
import { RemoveUserCommand } from '../../users/application/use-cases/graphql/remove-user.use-case';
import { UnbanUserCommand } from '../../users/application/use-cases/graphql/unban-user.use-case';
import { QueryStringInput } from '../common/query-string-input.model';
import { GetUserFollowersQuery } from '../../users/application/queryBus/graphql/get-user-followers.use-case';
import { GetUserFollowingQuery } from '../../users/application/queryBus/graphql/get-user-following.use-case';

@Resolver(() => UserModel)
export class UsersResolver {
  constructor(
    private readonly userImagesLoader: UserAvatarsLoader,
    private readonly postsPhotosLoader: PostsPhotosLoader,
    private readonly paymentsLoader: PaymentsLoader,
    private readonly logger: LoggerService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    this.logger.setContext(UsersResolver.name);
  }

  @Query(() => UserModel, { nullable: true })
  @UseGuards(BasicGqlGuard)
  async getUser(@Args('id') id: string) {
    this.logger.debug('Execute: Get user', this.getUser.name);
    const result: AppNotificationResultType<UserModel> =
      await this.queryBus.execute(new GetUserQuery(id));

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.getUser.name);
        return result.data;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug(`NotFound`, this.getUser.name);
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Query(() => PaginatedUserModel)
  @UseGuards(BasicGqlGuard)
  async getUsers(
    @Args('queryString', { type: () => UsersQueryStringInput, nullable: true })
    queryString: UsersQueryStringInput,
  ): Promise<PaginatedUserModel> {
    this.logger.debug('Execute: Get users', this.getUsers.name);
    const result: AppNotificationResultType<PaginatedUserModel> =
      await this.queryBus.execute(new GetUsersQuery(queryString));
    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.getUsers.name);
        return result.data;
      default:
        throw new InternalServerErrorException();
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(BasicGqlGuard)
  async deleteUser(
    @Args('userId', { type: () => String }) userId: string,
  ): Promise<boolean> {
    this.logger.debug('Execute: delete user', this.deleteUser.name);
    const result: AppNotificationResultType<null> =
      await this.commandBus.execute(new RemoveUserCommand(userId));
    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.deleteUser.name);
        return true;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug(`NotFound`, this.deleteUser.name);
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(BasicGqlGuard)
  async banUser(
    @Args('banUserInput', { type: () => BanUserInput })
    banUserInput: BanUserInput,
  ): Promise<boolean> {
    this.logger.debug('Execute: ban user', this.banUser.name);
    const result: AppNotificationResultType<null> =
      await this.commandBus.execute(new BanUserCommand(banUserInput));
    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.banUser.name);
        return true;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug(`NotFound`, this.banUser.name);
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(BasicGqlGuard)
  async unbanUser(
    @Args('userId', { type: () => String }) userId: string,
  ): Promise<boolean> {
    this.logger.debug('Execute: unban user', this.unbanUser.name);
    const result: AppNotificationResultType<boolean> =
      await this.commandBus.execute(new UnbanUserCommand(userId));
    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.unbanUser.name);
        return true;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug(`NotFound`, this.unbanUser.name);
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @ResolveField(() => FileModel, { nullable: true })
  async getAvatar(@Parent() user: UserModel) {
    return await this.userImagesLoader.generateDataLoader().load(user.id);
  }

  @ResolveField(() => [FileModel], { nullable: true })
  async getPostsPhotos(@Parent() user: UserModel) {
    return await this.postsPhotosLoader.generateDataLoader().load(user.id);
  }

  // @ResolveField(() => [PaymentsModel], { nullable: true })
  // async getPayments(@Parent() user: UserModel) {
  //   return await this.paymentsLoader.generateDataLoader().load(user.id);
  // }
}

@Resolver(() => FollowerModel)
export class UserFollowingResolver {
  constructor(
    private readonly userImagesLoader: UserAvatarsLoader,
    private readonly logger: LoggerService,
    private readonly queryBus: QueryBus,
  ) {
    this.logger.setContext(FollowerModel.name);
  }

  @Query(() => PaginatedFollowerModel)
  @UseGuards(BasicGqlGuard)
  async getFollowers(
    @Args('userId') userId: string,
    @Args('queryString', { type: () => QueryStringInput, nullable: true })
    queryString: QueryStringInput,
  ): Promise<PaginatedFollowerModel> {
    this.logger.debug(
      'Execute: Get followers for user',
      this.getFollowers.name,
    );
    const result: AppNotificationResultType<PaginatedFollowerModel> =
      await this.queryBus.execute(
        new GetUserFollowersQuery(userId, queryString),
      );
    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.getFollowers.name);
        return result.data;
      default:
        throw new InternalServerErrorException();
    }
  }

  @Query(() => PaginatedFollowerModel)
  @UseGuards(BasicGqlGuard)
  async getFollowing(
    @Args('userId') userId: string,
    @Args('queryString', { type: () => QueryStringInput, nullable: true })
    queryString: QueryStringInput,
  ): Promise<PaginatedFollowerModel> {
    this.logger.debug(
      'Execute: Get following for user',
      this.getFollowing.name,
    );
    const result: AppNotificationResultType<PaginatedFollowerModel> =
      await this.queryBus.execute(
        new GetUserFollowingQuery(userId, queryString),
      );
    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.getFollowing.name);
        return result.data;
      default:
        throw new InternalServerErrorException();
    }
  }

  @ResolveField(() => FileModel, { nullable: true })
  async getAvatar(@Parent() user: FollowerModel) {
    return await this.userImagesLoader.generateDataLoader().load(user.id);
  }
}
