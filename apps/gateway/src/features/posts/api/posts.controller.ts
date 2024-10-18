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
import { CommandBus } from '@nestjs/cqrs';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../../auth/api/decorators/current-user-id-param.decorator';
import { ValidationError } from 'class-validator';
import { Notification } from 'apps/gateway/src/common/domain/notification';
import { AddPostSwagger } from './swagger/add-post.swagger';
import {
  UpdatePostCodes,
  UpdatePostCommand,
} from '../application/use-cases/update-post.use-case';
import { UpdatePostSwagger } from './swagger/update-post.swagger';
import { AddPostDto } from './dto/input-dto/add-post.dto';
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
  GetPostCommand,
} from '../application/use-cases/get-public-post.use-case';
import { PostOutputDto } from './dto/output-dto/post.output-dto';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';
import { GetPostsSwagger } from './swagger/get-posts.swagger';
import {
  GetPostsCodes,
  GetPostsByUserCommand,
} from '../application/use-cases/get-posts-by-user.use-case';
import { SearchQueryParametersType } from 'apps/gateway/src/common/domain/query.types';

@ApiTags('Posts')
@Controller('posts')
// @LogClass({
//   level: 'trace',
//   loggerClassField: 'logger',
//   active: () => process.env.NODE_ENV !== 'production',
// })
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    @InjectCustomLoggerService() private readonly logger: CustomLoggerService,
  ) {
    logger.setContext(PostsController.name);
  }
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
    const addPostResult: Notification<string, ValidationError> =
      await this.commandBus.execute(
        new AddPostCommand(userId, files, addPostDto.description),
      );
    const addPostResultCode = addPostResult.getCode();
    let getPostResultCode;
    if (addPostResultCode === AddPostCodes.Success) {
      const postId = addPostResult.getData();
      const getPostResult = await this.commandBus.execute(
        new GetPostCommand(postId),
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
      getPostResultCode === GetPostCodes.TransactionError
    ) {
      throw new InternalServerErrorException();
    }
  }

  // @Post('photos')
  // @UseInterceptors(FilesInterceptor('files'))
  // @HttpCode(HttpStatus.OK)
  // @UploadPhotoSwagger()
  // @UseGuards(JwtAuthGuard)
  // async addPhoto(
  //   @UploadedFiles() files: Express.Multer.File[],
  //   @CurrentUserId() userId: string,
  // ) {
  //   this.logger.log('info', 'start upload photo request', {});
  //   const result: Notification<string, ValidationError> =
  //     await this.commandBus.execute(new UploadPhotosCommand(userId, file));
  //   const code = result.getCode();
  //   if (code === UploadPhotoCodes.Success) return result.getData();
  //   if (code === UploadPhotoCodes.ValidationCommandError)
  //     throw new UnprocessableEntityException({
  //       statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  //       message: 'Validation failed',
  //       errors: result.getErrors().map((e) => ({
  //         property: e.property,
  //         constraints: e.constraints,
  //       })),
  //     });
  //   if (code === UploadPhotoCodes.TransactionError)
  //     throw new InternalServerErrorException();
  // }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UpdatePostSwagger()
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const result: Notification<string, ValidationError> =
      await this.commandBus.execute(
        new UpdatePostCommand(id, userId, updatePostDto.description),
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeletePostSwagger()
  @UseGuards(JwtAuthGuard)
  async deletePost(@CurrentUserId() userId: string, @Param('id') id: string) {
    const result: Notification<string, ValidationError> =
      await this.commandBus.execute(new DeletePostCommand(id, userId));

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

  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  @GetPostsSwagger()
  async getPostsByUser(
    @Param('userId') userId: string,
    @Query() query?: SearchQueryParametersType,
  ) {
    const result: Notification<PostOutputDto[], ValidationError> =
      await this.commandBus.execute(new GetPostsByUserCommand(userId, query));

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
