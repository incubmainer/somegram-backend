import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotificationObject } from '../../../../../common/domain/notification';
import { UsersQueryRepository } from '../../../../users/infrastructure/users.query-repository';

import {
  PostOutputDto,
  postToOutputMapper,
} from '../../../api/dto/output-dto/post.output-dto';
import { PostsQueryRepository } from '../../../infrastructure/posts.query-repository';
import { PhotoServiceAdapter } from '../../../../../common/adapter/photo-service.adapter';
import { LoggerService } from '@app/logger';
import { SearchQueryParametersType } from '../../../../../common/domain/query.types';
import { getSanitizationQuery } from '../../../../../common/utils/query-params.sanitizator';
import { Pagination, PaginatorService } from '@app/paginator';

export const GetPublicPostsCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
};

export class GetPublicPostsByUserQuery {
  constructor(
    public queryString?: SearchQueryParametersType,
    public endCursorPostId?: string,
  ) {}
}

@QueryHandler(GetPublicPostsByUserQuery)
export class GetPublicPostsByUserUseCase
  implements IQueryHandler<GetPublicPostsByUserQuery>
{
  constructor(
    private readonly logger: LoggerService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly paginatorService: PaginatorService,
  ) {
    this.logger.setContext(GetPublicPostsByUserUseCase.name);
  }
  async execute(command: GetPublicPostsByUserQuery) {
    const { queryString, endCursorPostId } = command;
    const notification = new NotificationObject<Pagination<PostOutputDto[]>>(
      GetPublicPostsCodes.Success,
    );

    const sanitizationQuery = getSanitizationQuery(queryString);
    try {
      const { posts, count } = await this.postsQueryRepository.getAllPosts(
        queryString,
        endCursorPostId,
      );

      const mappedPosts = await Promise.all(
        posts.map(async (post) => {
          const user = await this.usersQueryRepository.findUserById(
            post.userId,
          );
          const avatar = await this.photoServiceAdapter.getAvatar(post.userId);
          const postPhotos = await this.photoServiceAdapter.getPostPhotos(
            post.id,
          );
          return postToOutputMapper(post, user, avatar, postPhotos);
        }),
      );

      const result = this.paginatorService.create<PostOutputDto[]>(
        sanitizationQuery.pageNumber,
        sanitizationQuery.pageSize,
        count,
        mappedPosts,
      );

      notification.setData(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      notification.setCode(GetPublicPostsCodes.TransactionError);
    }
    return notification;
  }
}
