import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';
import { Pagination, PaginatorService } from '@app/paginator';
import { UserPostWithOwnerInfo } from '../../domain/types';
import {
  AdminPostsSortByEnum,
  PostsQueryStringInput,
} from '../../../resolvers/posts/models/posts-query-string-input';

import { Prisma } from '@prisma/gateway';

export class GetAdminPostsByUserQuery {
  constructor(public queryString?: PostsQueryStringInput) {}
}

@QueryHandler(GetAdminPostsByUserQuery)
export class GetAdminPostsByUserUseCase
  implements
    IQueryHandler<
      GetAdminPostsByUserQuery,
      AppNotificationResultType<Pagination<UserPostWithOwnerInfo[]>>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly appNotification: ApplicationNotification,
    private readonly paginatorService: PaginatorService,
  ) {
    this.logger.setContext(GetAdminPostsByUserUseCase.name);
  }
  async execute(
    command: GetAdminPostsByUserQuery,
  ): Promise<AppNotificationResultType<Pagination<UserPostWithOwnerInfo[]>>> {
    this.logger.debug('Execute: get posts by admin command', this.execute.name);
    const { queryString } = command;

    try {
      const { pageSize, pageNumber, searchByUsername, sortBy, sortDirection } =
        queryString;

      let orderBy: Prisma.UserPostOrderByWithRelationInput;

      if (sortBy === AdminPostsSortByEnum.username) {
        orderBy = { User: { username: sortDirection } };
      } else {
        orderBy = { [sortBy]: sortDirection };
      }

      const where: Prisma.UserPostWhereInput = {
        ...(searchByUsername
          ? {
              User: {
                username: {
                  contains: searchByUsername,
                  mode: 'insensitive',
                },
              },
            }
          : {}),
      };

      const skip = (pageNumber - 1) * pageSize;

      const { posts, count } =
        await this.postsQueryRepository.getAllPostsWithOwnerInfo(
          where,
          orderBy,
          pageSize,
          skip,
        );

      const result: any = this.paginatorService.create(
        pageNumber,
        pageSize,
        count,
        posts,
      );

      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
