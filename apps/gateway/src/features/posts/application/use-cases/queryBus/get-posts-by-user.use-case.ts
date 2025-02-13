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
import { Pagination, PaginatorService } from '@app/paginator';
import { getSanitizationQuery } from '../../../../../common/utils/query-params.sanitizator';

export const GetPostsCodes = {
  Success: Symbol('success'),
  UserNotFound: Symbol('userNotFound'),
  TransactionError: Symbol('transactionError'),
};

export class GetPostsByUserQuery {
  constructor(
    public userId: string,
    public queryString?: SearchQueryParametersType,
    public endCursorPostId?: string,
  ) {}
}

@QueryHandler(GetPostsByUserQuery)
export class GetPostsByUserUseCase
  implements IQueryHandler<GetPostsByUserQuery>
{
  constructor(
    private readonly logger: LoggerService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly paginatorService: PaginatorService,
  ) {
    this.logger.setContext(GetPostsByUserUseCase.name);
  }
  async execute(command: GetPostsByUserQuery) {
    const { userId, queryString, endCursorPostId } = command;
    const notification = new NotificationObject<Pagination<PostOutputDto[]>>(
      GetPostsCodes.Success,
    );

    const user = await this.usersQueryRepository.findUserById(userId);
    if (!user) {
      notification.setCode(GetPostsCodes.UserNotFound);
      return notification;
    }
    const sanitizationQuery = getSanitizationQuery(queryString);
    try {
      const avatar = await this.photoServiceAdapter.getAvatar(userId);

      const { posts, count } = await this.postsQueryRepository.getPostsByUser(
        user.id,
        queryString,
        endCursorPostId,
      );
      const mappedPosts = await Promise.all(
        posts.map(async (post) => {
          return postToOutputMapper(
            post,
            user,
            avatar,
            await this.photoServiceAdapter.getPostPhotos(post.id),
          );
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
      //this.logger.log('error', 'transaction error', { e });
      notification.setCode(GetPostsCodes.TransactionError);
    }
    return notification;
  }
}
