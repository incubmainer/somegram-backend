import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../../auth/api/decorators/current-user-id-param.decorator';
import { ValidationError } from 'class-validator';
import { AddPostDto } from './dto/input.dto';
import { Notification } from 'apps/gateway/src/common/domain/notification';
import { AddPostCommand } from '../application/use-cases/add-post-use-case';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async addPost(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUserId() userId: string,
    @Body() addPostDto: AddPostDto,
  ) {
    try {
      const result: Notification<string, ValidationError> =
        await this.commandBus.execute(
          new AddPostCommand(
            userId,
            file.buffer,
            file.mimetype,
            addPostDto.description,
          ),
        );
    } catch (e) {}
  }
}
