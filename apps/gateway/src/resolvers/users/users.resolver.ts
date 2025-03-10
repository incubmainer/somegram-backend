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
import { LoggerService } from '@app/logger';

import { BasicGqlGuard } from '../../common/guards/graphql/basic-gql.guard';
import { PaginatedUserModel } from './models/paginated-user.model';
import { UserModel } from './models/user.model';
import { BanUserInput } from './models/ban-user-input';
import { UsersQueryStringInput } from './models/users-query-string-input';
import { FileModel } from './models/file-model';
import { UserAvatarsLoader } from '../../common/data-loaders/user-avatars-loader';
import { PostsPhotosLoader } from '../../common/data-loaders/posts-photos-loader';
import { PaymentsModel } from '../payments/models/payments.model';
import { PaymentsLoader } from '../../common/data-loaders/payments-loader';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RemoveUserCommand } from '../../features/users/application/use-cases/graphql/remove-user.use-case';
import { BanUserCommand } from '../../features/users/application/use-cases/graphql/ban-user.use-case';
import { UnbanUserCommand } from '../../features/users/application/use-cases/graphql/unban-user.use-case';
import { GetUserQuery } from '../../features/users/application/query-command/graphql/get-user.use-case';
import { GetUsersQuery } from '../../features/users/application/query-command/graphql/get-users.use-case';

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
