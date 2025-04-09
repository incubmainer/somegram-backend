import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { Pagination } from '@app/paginator';
import { LoggerService } from '@app/logger';

import { JwtAuthGuard } from '../../../common/guards/jwt/jwt-auth.guard';
import { CurrentUserId } from '../../../common/decorators/http-parse/current-user-id-param.decorator';
import { PostOutputDto } from './dto/output-dto/post.output-dto';
import { SearchQueryParameters } from 'apps/gateway/src/common/domain/query.types';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { FOLLOWING_POST_ROUTE } from '../../../common/constants/route.constants';
import { GetFollowingsPostsQuery } from '../application/queryBus/get-followings-posts.use-case';
import { GetFollowingPostsSwagger } from './swagger/get-following-posts.swagger';

@ApiTags('Posts-following')
@UseGuards(JwtAuthGuard)
@Controller(FOLLOWING_POST_ROUTE.MAIN)
export class FollowingPostsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(FollowingPostsController.name);
  }

  @Get(`${FOLLOWING_POST_ROUTE.POSTS}/:endCursorPostId?`)
  @HttpCode(HttpStatus.OK)
  @GetFollowingPostsSwagger()
  async getFollowingsPosts(
    @CurrentUserId() currentUserId: string,
    @Param('endCursorPostId') endCursorPostId?: string,
    @Query() query?: SearchQueryParameters,
  ): Promise<Pagination<any[]>> {
    this.logger.debug(
      'Execute: get followings posts',
      this.getFollowingsPosts.name,
    );
    const result: AppNotificationResultType<Pagination<PostOutputDto[]>> =
      await this.queryBus.execute(
        new GetFollowingsPostsQuery(currentUserId, query, endCursorPostId),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.getFollowingsPosts.name);
        return result.data;
      default:
        throw new InternalServerErrorException();
    }
  }
}
