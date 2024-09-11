import {
  Body,
  Controller,
  HttpStatus,
  InternalServerErrorException,
  Post,
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
import { AddPostDto } from './dto/input.dto';
import { Notification } from 'apps/gateway/src/common/domain/notification';
import {
  AddPostCodes,
  AddPostCommand,
} from '../application/use-cases/add-post-use-case';
import { AddPostSwagger } from './swagger/add-post-swagger';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('add-post')
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
}
