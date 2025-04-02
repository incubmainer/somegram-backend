import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UnauthorizedException,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt/jwt-auth.guard';
import { CurrentUserId } from '../../../common/decorators/http-parse/current-user-id-param.decorator';
import { AddPostSwagger } from './swagger/add-post.swagger';
import { UpdatePostCommand } from '../application/use-cases/update-post.use-case';
import { UpdatePostSwagger } from './swagger/update-post.swagger';
import {
  AddPostDto,
  MimeTypes,
  POST_CONSTRAINTS,
} from './dto/input-dto/add-post.dto';
import { DeletePostSwagger } from './swagger/delete-postswagger';
import { DeletePostCommand } from '../application/use-cases/delete-post.use-case';
import { AddPostCommand } from '../application/use-cases/add-post.use-case';
import { UpdatePostDto } from './dto/input-dto/update-post.dto';
import { GetPostQuery } from '../application/queryBus/get-public-post.use-case';
import { PostOutputDto } from './dto/output-dto/post.output-dto';
import { GetPostsSwagger } from './swagger/get-user-posts.swagger';
import { GetPostsByUserQuery } from '../application/queryBus/get-posts-by-user.use-case';
import { SearchQueryParametersType } from 'apps/gateway/src/common/domain/query.types';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { Pagination } from '@app/paginator';
import { LoggerService } from '@app/logger';
import { POST_ROUTE } from '../../../common/constants/route.constants';
import { filesValidationPipe } from '../../../common/pipe/validation/validation-file.pipe';
import { AddLikeDislikePostCommand } from '../application/use-cases/add-like-dislike-post.use-case';
import { AddLikeDislikePostDto } from './dto/input-dto/add-like-dislike-post.dto';
import { AddLikeDislikeForPostSwagger } from './swagger/add-like-dislike-for-post.swagger';

@ApiTags('Posts')
@Controller(POST_ROUTE.MAIN)
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PostsController.name);
  }
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @AddPostSwagger()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async addPost(
    @UploadedFiles(
      filesValidationPipe(
        [MimeTypes.PNG, MimeTypes.JPEG],
        POST_CONSTRAINTS.MAX_PHOTO_SIZE,
        POST_CONSTRAINTS.MIN_PHOTO_COUNT,
        POST_CONSTRAINTS.MAX_PHOTO_COUNT,
      ),
    )
    files: Express.Multer.File[],
    @CurrentUserId() userId: string,
    @Body() addPostDto: AddPostDto,
  ): Promise<PostOutputDto> {
    this.logger.debug('Execute: add post', this.addPost.name);
    const result: AppNotificationResultType<string> =
      await this.commandBus.execute(
        new AddPostCommand(userId, files, addPostDto.description),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        const post: AppNotificationResultType<PostOutputDto> =
          await this.queryBus.execute(new GetPostQuery(result.data));
        this.logger.debug('Success', this.addPost.name);
        return post.data;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug('Not found', this.addPost.name);
        throw new UnauthorizedException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Put(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UpdatePostSwagger()
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @CurrentUserId() userId: string,
    @Param('postId') postId: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<void> {
    this.logger.debug('Execute: update post by id', this.updatePost.name);

    const result: AppNotificationResultType<null> =
      await this.commandBus.execute(
        new UpdatePostCommand(postId, userId, updatePostDto.description),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.updatePost.name);
        return;
      case AppNotificationResultEnum.Forbidden:
        this.logger.debug('Forbidden', this.updatePost.name);
        throw new ForbiddenException();
      case AppNotificationResultEnum.NotFound:
        this.logger.debug('Not found', this.updatePost.name);
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Delete(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeletePostSwagger()
  @UseGuards(JwtAuthGuard)
  async deletePost(
    @CurrentUserId() userId: string,
    @Param('postId') postId: string,
  ): Promise<void> {
    this.logger.debug('Execute: delete post by id', this.deletePost.name);
    const result: AppNotificationResultType<null> =
      await this.commandBus.execute(new DeletePostCommand(postId, userId));

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.deletePost.name);
        return;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug('Not found', this.deletePost.name);
        throw new NotFoundException();
      case AppNotificationResultEnum.Forbidden:
        this.logger.debug('Forbidden', this.deletePost.name);
        throw new ForbiddenException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Get(':userId/:endCursorPostId?')
  @HttpCode(HttpStatus.OK)
  @GetPostsSwagger()
  async getPostsByUser(
    @Param('userId') userId: string,
    @Param('endCursorPostId') endCursorPostId?: string,
    @Query() query?: SearchQueryParametersType,
  ): Promise<Pagination<PostOutputDto[]>> {
    this.logger.debug(
      'Execute: get posts by user id',
      this.getPostsByUser.name,
    );
    const result: AppNotificationResultType<Pagination<PostOutputDto[]>> =
      await this.queryBus.execute(
        new GetPostsByUserQuery(userId, query, endCursorPostId),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.getPostsByUser.name);
        return result.data;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug('Not found', this.getPostsByUser.name);
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Put(`${POST_ROUTE.LIKE}/:postId`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @AddLikeDislikeForPostSwagger()
  @UseGuards(JwtAuthGuard)
  async likePost(
    @CurrentUserId() userId: string,
    @Param('postId') postId: string,
    @Body() body: AddLikeDislikePostDto,
  ): Promise<void> {
    this.logger.debug('Execute: add like/dislike for', this.likePost.name);
    const result: AppNotificationResultType<null> =
      await this.commandBus.execute(
        new AddLikeDislikePostCommand(userId, postId, body),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.likePost.name);
        return;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug('Not found', this.likePost.name);
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }
}
