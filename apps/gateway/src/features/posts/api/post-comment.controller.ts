import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { POST_COMMENT_ROUTE } from '../../../common/constants/route.constants';
import {
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AddPostCommentDto } from './dto/input-dto/add-post-comment.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt/jwt-auth.guard';
import { CurrentUserId } from '../../../common/decorators/http-parse/current-user-id-param.decorator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { AddPostCommentCommand } from '../application/use-cases/add-comment.use-case';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { AddCommentForPostSwagger } from './swagger/add-cooment-for-post.swagger';
import { AddAnswerForCommentSwagger } from './swagger/add-answer-for-cooment.swagger';
import { AddAnswerForCommentDto } from './dto/input-dto/add-answer-for-comment.dto';
import { AddAnswerForCommentCommand } from '../application/use-cases/add-answer-for-comment.use-case';
import { AddLikeDislikeCommentDto } from './dto/input-dto/add-like-dislike-comment.dto';
import { AddLikeDislikeCommentCommand } from '../application/use-cases/add-like-dislike-comment.use-case';
import { AddLikeDislikeForCommentSwagger } from './swagger/add-like-dislike-for-comment.swagger';
import { GetCommentAnswersSwagger } from './swagger/get-comment-answers.swagger';
import { GetCommentAnswersQueryDto } from './dto/input-dto/get-comment-answers.query.dto';
import { Pagination } from '@app/paginator';
import { CommentAnswersOutputDto } from './dto/output-dto/comment-answers.output-dto';
import { GetCommentAnswersByCommentIdQuery } from '../application/queryBus/get-comment-answers-by-comment-id.use-case';

@ApiTags('Post comments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@Controller(POST_COMMENT_ROUTE.MAIN)
export class PostCommentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PostCommentController.name);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(`:postId`)
  @AddCommentForPostSwagger()
  async createComment(
    @Body() body: AddPostCommentDto,
    @CurrentUserId() userId: string,
    @Param('postId') postId: string,
  ): Promise<void> {
    this.logger.debug('Execute: create post comment', this.createComment.name);

    const result: AppNotificationResultType<null> =
      await this.commandBus.execute(
        new AddPostCommentCommand(userId, postId, body),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.createComment.name);
        return;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug('Not found', this.createComment.name);
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(`${POST_COMMENT_ROUTE.ANSWER_FOR_COMMENT}/:commentId`)
  @AddAnswerForCommentSwagger()
  async answerForComment(
    @Body() body: AddAnswerForCommentDto,
    @CurrentUserId() userId: string,
    @Param('commentId') commentId: string,
  ): Promise<void> {
    this.logger.debug(
      'Execute: add answer for comment',
      this.answerForComment.name,
    );

    const result: AppNotificationResultType<null> =
      await this.commandBus.execute(
        new AddAnswerForCommentCommand(userId, commentId, body),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.answerForComment.name);
        return;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug('Not found', this.answerForComment.name);
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(`${POST_COMMENT_ROUTE.LIKE}/:commentId`)
  @AddLikeDislikeForCommentSwagger()
  async likeComment(
    @Body() body: AddLikeDislikeCommentDto,
    @CurrentUserId() userId: string,
    @Param('commentId') commentId: string,
  ): Promise<void> {
    this.logger.debug(
      'Execute: add like/dislike for comment',
      this.likeComment.name,
    );

    const result: AppNotificationResultType<null> =
      await this.commandBus.execute(
        new AddLikeDislikeCommentCommand(userId, commentId, body),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.likeComment.name);
        return;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug('Not found', this.likeComment.name);
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Get(`:commentId/${POST_COMMENT_ROUTE.ANSWER_FOR_COMMENT}`)
  @GetCommentAnswersSwagger()
  async getCommentAnswersForComment(
    @Param('commentId') commentId: string,
    @CurrentUserId() userId: string,
    @Query() query: GetCommentAnswersQueryDto,
  ): Promise<Pagination<CommentAnswersOutputDto[]>> {
    this.logger.debug(
      'Execute: get comment answers for comment',
      this.getCommentAnswersForComment.name,
    );

    const result: AppNotificationResultType<
      Pagination<CommentAnswersOutputDto[]>
    > = await this.queryBus.execute(
      new GetCommentAnswersByCommentIdQuery(commentId, userId, query),
    );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.getCommentAnswersForComment.name);
        return result.data;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug('Not found', this.getCommentAnswersForComment.name);
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }
}
