import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { Pagination } from '@app/paginator';
import { InternalServerErrorException } from '@nestjs/common';
import { PaginatedPostsModel } from './models/paginated-posts.model';
import { LoggerService } from '@app/logger';
import { PostOwnerModel } from './models/post-owner.model';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { GetAdminPostsByUserQuery } from '../../posts/application/queryBus/get-admin-posts.use-case';
import { FileModel } from '../users/models/file-model';
import { UserAvatarsLoader } from '../../../common/data-loaders/user-avatars-loader';

import { PostModel } from './models/post.model';
import { UserPostWithOwnerInfo } from '../../posts/domain/types';
import { PostsPhotosLoaderByPost } from '../../../common/data-loaders/posts-photos-loader-by-post';
import { PostsQueryStringInput } from './models/posts-query-string-input';

@Resolver(() => PostModel)
export class PostsResolver {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
    private readonly postsPhotosLoader: PostsPhotosLoaderByPost,
  ) {
    this.logger.setContext(PostsResolver.name);
  }

  @Query(() => PaginatedPostsModel)
  async getPosts(
    @Args('queryString', { type: () => PostsQueryStringInput, nullable: true })
    queryString?: PostsQueryStringInput,
  ): Promise<PaginatedPostsModel> {
    this.logger.debug('Execute get posts', this.getPosts.name);

    const result: AppNotificationResultType<
      Pagination<UserPostWithOwnerInfo[]>
    > = await this.queryBus.execute(
      new GetAdminPostsByUserQuery(queryString || new PostsQueryStringInput()),
    );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.getPosts.name);
        return result.data as PaginatedPostsModel;
      default:
        throw new InternalServerErrorException();
    }
  }

  @ResolveField(() => PostOwnerModel)
  async postOwnerInfo(
    @Parent() post: UserPostWithOwnerInfo,
  ): Promise<PostOwnerModel> {
    return {
      userId: post.User.id,
      username: post.User.username,
    };
  }

  @ResolveField(() => [FileModel], { nullable: true })
  async getPostsPhotos(@Parent() post: PostModel) {
    return await this.postsPhotosLoader.generateDataLoader().load(post.id);
  }
}

@Resolver(() => PostOwnerModel)
export class PostOwnerResolver {
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly userImagesLoader: UserAvatarsLoader,
  ) {}

  @ResolveField(() => String, { nullable: true })
  profileUrl(@Parent() owner: PostOwnerModel): string {
    const frontProvider = this.configService.get('envSettings', {
      infer: true,
    }).FRONTED_PROVIDER;
    return `${frontProvider}/public-user/profile/${owner.userId}`;
  }

  @ResolveField(() => FileModel, { nullable: true })
  async getAvatar(@Parent() owner: PostOwnerModel) {
    return await this.userImagesLoader.generateDataLoader().load(owner.userId);
  }
}
