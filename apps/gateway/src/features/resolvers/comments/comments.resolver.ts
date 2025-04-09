import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { GetAdminPostCommentAnswersQuery } from '../../posts/application/queryBus/graphql/get-admin-post-comment-answers.use-case';
import { CommentsQueryStringInput } from './models/comments-query-string-input';
import { AppNotificationResultEnum } from '@app/application-notification';
import {
  InternalServerErrorException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { PaginatedCommentModel } from './models/paginated-comment.model';
import { CommentModel } from './models/comment.model';
import { BasicGqlGuard } from '../../../common/guards/graphql/basic-gql.guard';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { UserAvatarsLoader } from '../../../common/data-loaders/user-avatars-loader';
import { FileModel } from '../users/models/file-model';
import { CommentOwnerModel } from './models/comment-owner.model';
import {
  AdminCommentAnswerRawModel,
  AdminPostCommentRawModel,
} from '../../posts/domain/types';
import { CommentLikeModel } from './models/comment-like.model';
import { GetAdminPostCommentsQuery } from '../../posts/application/queryBus/graphql/get-admin-post-comments.use-case';

@Resolver(() => CommentModel)
export class CommentsResolver {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(CommentsResolver.name);
  }

  @Query(() => PaginatedCommentModel)
  @UseGuards(BasicGqlGuard)
  async getCommentsForPost(
    @Args('queryString', {
      type: () => CommentsQueryStringInput,
      nullable: true,
    })
    queryString: CommentsQueryStringInput,
    @Args('postId') postId: string,
  ): Promise<any> {
    this.logger.debug(
      'Execute: get comments for post by post id (admin)',
      this.getCommentsForPost.name,
    );

    const result = await this.queryBus.execute(
      new GetAdminPostCommentsQuery(
        postId,
        queryString || new CommentsQueryStringInput(),
      ),
    );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.getCommentsForPost.name);
        return result.data as PaginatedCommentModel;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug('Not found', this.getCommentsForPost.name);
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Query(() => PaginatedCommentModel)
  @UseGuards(BasicGqlGuard)
  async getAnswersForComment(
    @Args('queryString', {
      type: () => CommentsQueryStringInput,
      nullable: true,
    })
    queryString: CommentsQueryStringInput,
    @Args('commentId') commentId: string,
  ): Promise<any> {
    this.logger.debug(
      'Execute: get answers for comment by comment id',
      this.getAnswersForComment.name,
    );

    const result = await this.queryBus.execute(
      new GetAdminPostCommentAnswersQuery(
        commentId,
        queryString || new CommentsQueryStringInput(),
      ),
    );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.getAnswersForComment.name);
        return result.data as PaginatedCommentModel;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug('Not found', this.getAnswersForComment.name);
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @ResolveField(() => CommentOwnerModel)
  async commentOwnerInfo(
    @Parent() comment: AdminPostCommentRawModel | AdminCommentAnswerRawModel,
  ): Promise<CommentOwnerModel> {
    return {
      id: comment.commentatorId,
      username: comment.username,
    };
  }

  @ResolveField(() => CommentLikeModel)
  async likeInfo(
    @Parent() comment: AdminPostCommentRawModel,
  ): Promise<CommentLikeModel> {
    return {
      like: comment.likes,
      dislike: comment.dislikes,
    };
  }
}

@Resolver(() => CommentOwnerModel)
export class CommentOwnerResolver {
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly userImagesLoader: UserAvatarsLoader,
  ) {}

  @ResolveField(() => String, { nullable: true })
  profileUrl(@Parent() owner: CommentOwnerModel): string {
    const frontProvider = this.configService.get('envSettings', {
      infer: true,
    }).FRONTED_PROVIDER;
    return `${frontProvider}/public-user/profile/${owner.id}`;
  }

  @ResolveField(() => FileModel, { nullable: true })
  async getAvatar(@Parent() owner: CommentOwnerModel): Promise<FileModel> {
    return await this.userImagesLoader.generateDataLoader().load(owner.id);
  }
}
