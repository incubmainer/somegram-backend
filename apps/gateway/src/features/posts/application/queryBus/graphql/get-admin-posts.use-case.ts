import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { Pagination, PaginatorService } from '@app/paginator';
import { UserPostWithOwnerInfo } from '../../../domain/types';
import { PostsQueryStringInput } from '../../../../resolvers/posts/models/posts-query-string-input';

import { PostsGraphqlQueryRepository } from '../../../infrastructure/posts-graphql.query-repository';

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
    private readonly postsQueryRepository: PostsGraphqlQueryRepository,
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
      const { pageSize, pageNumber } = queryString;

      const { posts, count } =
        await this.postsQueryRepository.getAllPostsWithOwnerInfo(queryString);

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
