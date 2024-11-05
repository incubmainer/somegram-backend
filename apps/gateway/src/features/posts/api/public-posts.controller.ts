import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { NotificationObject } from 'apps/gateway/src/common/domain/notification';
import {
  GetPostCodes,
  GetPostQuery,
} from '../application/use-cases/queryBus/get-public-post.use-case';
import { PostOutputDto } from './dto/output-dto/post.output-dto';
import { GetPublicPostSwagger } from './swagger/get-public-post.swagger';
import {
  GetPublicPostsCodes,
  GetPublicPostsByUserQuery,
} from '../application/use-cases/queryBus/get-public-posts.use-case';
import { SearchQueryParametersType } from 'apps/gateway/src/common/domain/query.types';
import { GetPublicPostsSwagger } from './swagger/get-public-posts.swagger';

@ApiTags('Public-Posts')
@Controller('public-posts')
export class PublicPostsController {
  constructor(private readonly queryBus: QueryBus) {}
  @Get('all/:endCursorPostId?')
  @GetPublicPostsSwagger()
  @HttpCode(HttpStatus.OK)
  async getPublicPosts(
    @Query() query?: SearchQueryParametersType,
    @Param('endCursorPostId') endCursorPostId?: string,
  ) {
    const result: NotificationObject<PostOutputDto, null> =
      await this.queryBus.execute(
        new GetPublicPostsByUserQuery(query, endCursorPostId),
      );
    const code = result.getCode();
    if (code === GetPublicPostsCodes.Success) return result.getData();
    if (code === GetPublicPostsCodes.TransactionError)
      throw new InternalServerErrorException();
  }

  @Get(':postId')
  @GetPublicPostSwagger()
  @HttpCode(HttpStatus.OK)
  async getPublicPost(@Param('postId') postId: string) {
    const result: NotificationObject<PostOutputDto, null> =
      await this.queryBus.execute(new GetPostQuery(postId));
    const code = result.getCode();
    if (code === GetPostCodes.Success) return result.getData();
    if (code === GetPostCodes.PostNotFound)
      throw new NotFoundException('Post not found');
    if (code === GetPostCodes.TransactionError)
      throw new InternalServerErrorException();
  }
}
