import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  UnauthorizedException,
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
import {
  AddPostCodes,
  AddPostCommand,
} from '../application/use-cases/add-post-use-case';
import { AddPostSwagger } from './swagger/add-post-swagger';
import {
  UpdatePostCodes,
  UpdatePostCommand,
} from '../application/use-cases/update-post-use-case';
import { UpdatePostSwagger } from './swagger/update-post-swagger';
import { UpdatePostDto } from './dto/update-post.dto';
import { AddPostDto } from './dto/input.dto';
import { DeletePostSwagger } from './swagger/delete-post-swagger';
import {
  DeletePostCodes,
  DeletePostCommand,
} from '../application/use-cases/delete-post-use-case';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10))
  @AddPostSwagger()
  @UseGuards(JwtAuthGuard)
  async addPost(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUserId() userId: string,
    @Body() addPostDto: AddPostDto,
  ) {
    console.log('🚀 ~ PostsController ~ files:', files);
    const result: Notification<string, ValidationError> =
      await this.commandBus.execute(
        new AddPostCommand(userId, files, addPostDto.description),
      );

    const code = result.getCode();
    if (code === AddPostCodes.Success)
      return {
        message: 'Post created successfully',
        photoUrl: result.getDate(),
      };
    if (code === AddPostCodes.ValidationCommandError)
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Validation failed',
        errors: result.getErrors().map((e) => ({
          property: e.property,
          constraints: e.constraints,
        })),
      });
    if (code === AddPostCodes.UserNotFound) throw new UnauthorizedException();
    if (code === AddPostCodes.TransactionError)
      throw new InternalServerErrorException();
  }

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
        new UpdatePostCommand(userId, id, updatePostDto.description),
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
    if (code === UpdatePostCodes.PostNotFound) throw new NotFoundException();
    if (code === UpdatePostCodes.UserNotFound)
      throw new UnauthorizedException();
    if (code === UpdatePostCodes.TransactionError)
      throw new InternalServerErrorException();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeletePostSwagger()
  @UseGuards(JwtAuthGuard)
  async deletePost(@CurrentUserId() userId: string, @Param('id') id: string) {
    const result: Notification<string, ValidationError> =
      await this.commandBus.execute(new DeletePostCommand(userId, id));

    const code = result.getCode();
    if (code === DeletePostCodes.Success) return;
    if (code === DeletePostCodes.ValidationCommandError)
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Validation failed',
        errors: result.getErrors().map((e) => ({
          property: e.property,
          constraints: e.constraints,
        })),
      });
    if (code === DeletePostCodes.UserNotFound)
      throw new UnauthorizedException();
    if (code === DeletePostCodes.TransactionError)
      throw new InternalServerErrorException();
  }
}
