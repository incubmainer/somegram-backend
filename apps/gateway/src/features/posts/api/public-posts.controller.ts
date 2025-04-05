import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { GetPostQuery } from '../application/queryBus/get-public-post.use-case';
import { PostOutputDto } from './dto/output-dto/post.output-dto';
import { GetPublicPostSwagger } from './swagger/get-public-post.swagger';
import { GetPublicPostsByUserQuery } from '../application/queryBus/get-public-posts.use-case';
import { SearchQueryParametersType } from 'apps/gateway/src/common/domain/query.types';
import { GetPublicPostsSwagger } from './swagger/get-public-posts.swagger';
import { POST_PUBLIC_ROUTE } from '../../../common/constants/route.constants';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { Pagination } from '@app/paginator';
import { LoggerService } from '@app/logger';
import { GetCommentForPostSwagger } from './swagger/get-cooments-for-post.swagger';
import { GetCommentsForPostQueryDto } from './dto/input-dto/get-comments-for-post.query.dto';
import { CommentPostOutputDto } from './dto/output-dto/comment-post.output-dto';
import { GetPostCommentsByPostIdQuery } from '../application/queryBus/get-post-comments-by-post-id.use-case';
import { RefreshJWTVerifyUserGuard } from '../../../common/guards/jwt/jwt-refresh-verify-user-guard';
import { CurrentUser } from '../../../common/decorators/http-parse/current-user.decorator';
import { JWTRefreshTokenPayloadType } from '../../auth/domain/types';

@ApiTags('Public-Posts')
@Controller(POST_PUBLIC_ROUTE.MAIN)
export class PublicPostsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PublicPostsController.name);
  }

  @Get(`${POST_PUBLIC_ROUTE.ALL}/:endCursorPostId?`)
  @GetPublicPostsSwagger()
  @HttpCode(HttpStatus.OK)
  async getPublicPosts(
    @Query() query?: SearchQueryParametersType,
    @Param('endCursorPostId') endCursorPostId?: string,
  ): Promise<Pagination<PostOutputDto[]>> {
    this.logger.debug('Execute: get posts', this.getPublicPosts.name);
    const result: AppNotificationResultType<Pagination<PostOutputDto[]>> =
      await this.queryBus.execute(
        new GetPublicPostsByUserQuery(query, endCursorPostId),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.getPublicPosts.name);
        return result.data;
      default:
        throw new InternalServerErrorException();
    }
  }

  @UseGuards(RefreshJWTVerifyUserGuard)
  @Get(':postId')
  @GetPublicPostSwagger()
  @HttpCode(HttpStatus.OK)
  async getPublicPost(
    @Param('postId') postId: string,
    @CurrentUser() user: JWTRefreshTokenPayloadType,
  ): Promise<PostOutputDto> {
    this.logger.debug('Execute: get post by id', this.getPublicPost.name);

    const result: AppNotificationResultType<PostOutputDto> =
      await this.queryBus.execute(
        new GetPostQuery(postId, user?.userId || null),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.getPublicPost.name);
        return result.data;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug('Not found', this.getPublicPost.name);
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @UseGuards(RefreshJWTVerifyUserGuard)
  @Get(`${POST_PUBLIC_ROUTE.COMMENTS}/:postId`)
  @GetCommentForPostSwagger()
  async getCommentsForPost(
    @Param('postId') postId: string,
    @CurrentUser() user: JWTRefreshTokenPayloadType,
    @Query() query: GetCommentsForPostQueryDto,
  ): Promise<Pagination<CommentPostOutputDto[]>> {
    this.logger.debug(
      'Execute: get comments for post',
      this.getCommentsForPost.name,
    );

    const result: AppNotificationResultType<
      Pagination<CommentPostOutputDto[]>
    > = await this.queryBus.execute(
      new GetPostCommentsByPostIdQuery(postId, user?.userId || null, query),
    );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.getCommentsForPost.name);
        return result.data;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug('Not found', this.getCommentsForPost.name);
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }
}
