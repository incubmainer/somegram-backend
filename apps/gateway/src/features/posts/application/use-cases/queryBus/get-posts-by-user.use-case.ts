import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotificationObject } from '../../../../../common/domain/notification';
import { UsersQueryRepository } from '../../../../users/infrastructure/users.query-repository';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';

import {
  PostOutputDto,
  postToOutputMapper,
} from '../../../api/dto/output-dto/post.output-dto';
import { Paginator } from 'apps/gateway/src/common/domain/paginator';
import { getSanitizationQuery } from 'apps/gateway/src/common/utils/query-params.sanitizator';
import { SearchQueryParametersType } from 'apps/gateway/src/common/domain/query.types';
import { PostsQueryRepository } from '../../../infrastructure/posts.query-repository';
import { PhotoServiceAdapter } from '../../../../../common/adapter/photo-service.adapter';
import { LoggerService } from '@app/logger';

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
// @LogClass({
//   level: 'trace',
//   loggerClassField: 'logger',
//   active: () => process.env.NODE_ENV !== 'production',
// })
export class GetPostsByUserUseCase
  implements IQueryHandler<GetPostsByUserQuery>
{
  constructor(
    private readonly logger: LoggerService,
    //@InjectCustomLoggerService() private readonly logger: CustomLoggerService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
  ) {
    this.logger.setContext(GetPostsByUserUseCase.name);
  }
  async execute(command: GetPostsByUserQuery) {
    const { userId, queryString, endCursorPostId } = command;
    const notification = new NotificationObject<Paginator<PostOutputDto[]>>(
      GetPostsCodes.Success,
    );

    const user = await this.usersQueryRepository.findUserById(userId);
    if (!user) {
      notification.setCode(GetPostsCodes.UserNotFound);
      return notification;
    }
    const sanitizationQuery = getSanitizationQuery(queryString);
    try {
      const avatarUrl = await this.photoServiceAdapter.getAvatar(userId);

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
            avatarUrl,
            await this.photoServiceAdapter.getPostPhotos(post.id),
          );
        }),
      );
      const result = new Paginator<PostOutputDto[]>(
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
