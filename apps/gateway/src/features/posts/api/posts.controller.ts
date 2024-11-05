import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UnprocessableEntityException,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../../auth/api/decorators/current-user-id-param.decorator';
import { ValidationError } from 'class-validator';
import { NotificationObject } from 'apps/gateway/src/common/domain/notification';
import { AddPostSwagger } from './swagger/add-post.swagger';
import {
  UpdatePostCodes,
  UpdatePostCommand,
} from '../application/use-cases/update-post.use-case';
import { UpdatePostSwagger } from './swagger/update-post.swagger';
import { AddPostDto, FileDto } from './dto/input-dto/add-post.dto';
import { DeletePostSwagger } from './swagger/delete-postswagger';
import {
  DeletePostCodes,
  DeletePostCommand,
} from '../application/use-cases/delete-post.use-case';
import {
  AddPostCodes,
  AddPostCommand,
} from '../application/use-cases/add-post.use-case';
import { UpdatePostDto } from './dto/input-dto/update-post.dto';
import {
  GetPostCodes,
  GetPostQuery,
} from '../application/use-cases/queryBus/get-public-post.use-case';
import { PostOutputDto } from './dto/output-dto/post.output-dto';
import { GetPostsSwagger } from './swagger/get-user-posts.swagger';
import {
  GetPostsCodes,
  GetPostsByUserQuery,
} from '../application/use-cases/queryBus/get-posts-by-user.use-case';
import { SearchQueryParametersType } from 'apps/gateway/src/common/domain/query.types';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @AddPostSwagger()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async addPost(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUserId() userId: string,
    @Body() addPostDto: AddPostDto,
  ) {
    const uploadedFiles: FileDto[] = files.map(
      (file) =>
        new FileDto(file.originalname, file.size, file.mimetype, file.buffer),
    );
    const addPostResult: NotificationObject<string, ValidationError> =
      await this.commandBus.execute(
        new AddPostCommand(userId, uploadedFiles, addPostDto.description),
      );
    const addPostResultCode = addPostResult.getCode();
    let getPostResultCode;
    if (addPostResultCode === AddPostCodes.Success) {
      const postId = addPostResult.getData();
      const getPostResult = await this.queryBus.execute(
        new GetPostQuery(postId),
      );
      getPostResultCode = getPostResult.getCode();
      if (getPostResultCode === GetPostCodes.Success) {
        const data = getPostResult.getData();
        return data;
      }
    }

    if (addPostResultCode === AddPostCodes.ValidationCommandError) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Validation failed',
        errors: addPostResult.getErrors().map((e) => ({
          property: e.property,
          constraints: e.constraints,
        })),
      });
    }

    if (
      addPostResultCode === AddPostCodes.TransactionError ||
      getPostResultCode === GetPostCodes.TransactionError ||
      getPostResultCode === GetPostCodes.PostNotFound
    ) {
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
  ) {
    const result: NotificationObject<string, ValidationError> =
      await this.commandBus.execute(
        new UpdatePostCommand(postId, userId, updatePostDto.description),
      );

    const code = result.getCode();
    if (code === UpdatePostCodes.Success) return;
    if (code === UpdatePostCodes.ValidationCommandError)
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Validation failed',
        errors: result.getErrors().map((e) => ({
          property: e.property,
          constraints: e.constraints,
        })),
      });
    if (code === UpdatePostCodes.PostNotFound)
      throw new NotFoundException('Post not found');
    if (code === UpdatePostCodes.UserNotOwner)
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'update_post_failed',
        message: 'User not owner of post',
      });
    if (code === UpdatePostCodes.TransactionError)
      throw new InternalServerErrorException();
  }

  @Delete(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeletePostSwagger()
  @UseGuards(JwtAuthGuard)
  async deletePost(
    @CurrentUserId() userId: string,
    @Param('postId') postId: string,
  ) {
    const result: NotificationObject<string, ValidationError> =
      await this.commandBus.execute(new DeletePostCommand(postId, userId));

    const code = result.getCode();
    if (code === DeletePostCodes.Success) return;
    if (code === DeletePostCodes.PostNotFound)
      throw new NotFoundException('Post not found');
    if (code === DeletePostCodes.UserNotOwner)
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'delete_post_failed',
        message: 'User not owner of post',
      });
    if (code === DeletePostCodes.TransactionError)
      throw new InternalServerErrorException();
  }

  @Get(':userId/:endCursorPostId?')
  @HttpCode(HttpStatus.OK)
  @GetPostsSwagger()
  async getPostsByUser(
    @Param('userId') userId: string,
    @Param('endCursorPostId') endCursorPostId?: string,
    @Query() query?: SearchQueryParametersType,
  ) {
    const result: NotificationObject<PostOutputDto[], ValidationError> =
      await this.queryBus.execute(
        new GetPostsByUserQuery(userId, query, endCursorPostId),
      );

    const code = result.getCode();
    if (code === GetPostsCodes.Success) {
      const posts = result.getData();
      return posts;
    }

    if (code === GetPostsCodes.UserNotFound) {
      throw new NotFoundException();
    }
    if (code === GetPostsCodes.TransactionError)
      throw new InternalServerErrorException();
  }
}
