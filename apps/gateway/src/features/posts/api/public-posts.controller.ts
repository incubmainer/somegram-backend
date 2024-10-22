import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { Notification } from 'apps/gateway/src/common/domain/notification';
import {
  GetPostCodes,
  GetPostQuery,
} from '../application/use-cases/get-public-post.use-case';
import { PostOutputDto } from './dto/output-dto/post.output-dto';
import { GetPublicPostSwagger } from './swagger/get-public-post.swagger';

@ApiTags('Public-Posts')
@Controller('public-posts')
export class PublicPostsController {
  constructor(private readonly queryBus: QueryBus) {}
  @Get(':postId')
  @GetPublicPostSwagger()
  @HttpCode(HttpStatus.OK)
  async getPublicPost(@Param('postId') postId: string) {
    const result: Notification<PostOutputDto, null> =
      await this.queryBus.execute(new GetPostQuery(postId));
    const code = result.getCode();
    if (code === GetPostCodes.Success) return result.getData();
    if (code === GetPostCodes.PostNotFound)
      throw new NotFoundException('Post not found');
    if (code === GetPostCodes.TransactionError)
      throw new InternalServerErrorException();
  }
}
