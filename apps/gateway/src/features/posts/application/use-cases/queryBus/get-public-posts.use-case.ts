import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotificationObject } from '../../../../../common/domain/notification';
import { UsersQueryRepository } from '../../../../users/infrastructure/users.query-repository';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';

import { AvatarStorageService } from '../../../../users/infrastructure/avatar-storage.service';
import { PostPhotoStorageService } from '../../../infrastructure/post-photo-storage.service';
import {
  PostOutputDto,
  postToOutputMapper,
} from '../../../api/dto/output-dto/post.output-dto';
import { Paginator } from 'apps/gateway/src/common/domain/paginator';
import { getSanitizationQuery } from 'apps/gateway/src/common/utils/query-params.sanitizator';
import { SearchQueryParametersType } from 'apps/gateway/src/common/domain/query.types';
import { PostsQueryRepository } from '../../../infrastructure/posts.query-repository';

export const GetPublicPostsCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
};

export class GetPublicPostsByUserQuery {
  constructor(public queryString?: SearchQueryParametersType) {}
}

@QueryHandler(GetPublicPostsByUserQuery)
@LogClass({
  level: 'trace',
  loggerClassField: 'logger',
  active: () => process.env.NODE_ENV !== 'production',
})
export class GetPublicPostsByUserUseCase
  implements IQueryHandler<GetPublicPostsByUserQuery>
{
  constructor(
    @InjectCustomLoggerService() private readonly logger: CustomLoggerService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly avatarStorageService: AvatarStorageService,
    private readonly postPhotoStorageService: PostPhotoStorageService,
  ) {
    logger.setContext(GetPublicPostsByUserUseCase.name);
  }
  async execute(command: GetPublicPostsByUserQuery) {
    const { queryString } = command;
    const notification = new NotificationObject<Paginator<PostOutputDto[]>>(
      GetPublicPostsCodes.Success,
    );

    const sanitizationQuery = getSanitizationQuery(queryString);
    const offset =
      (sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize;

    try {
      const { posts, count } =
        await this.postsQueryRepository.getPostsWithPhotos(
          offset,
          sanitizationQuery.pageSize,
        );

      const mappedPosts = await Promise.all(
        posts.map(async (post) => {
          const user =
            await this.usersQueryRepository.findUserWithAvatarInfoById(
              post.userId,
            );
          let avatarUrl = null;
          if (user.userAvatar) {
            avatarUrl = this.avatarStorageService.getAvatarUrl(
              user.userAvatar.avatarKey,
            );
          }

          return postToOutputMapper(
            post,
            user,
            avatarUrl,
            post.postPhotos.map((photo) =>
              this.postPhotoStorageService.getPhotoUrl(photo.photoKey),
            ),
          );
        }),
      );

      const result = new Paginator<PostOutputDto[]>(
        sanitizationQuery.pageNumber,
        sanitizationQuery.pageSize,
        count,
        mappedPosts,
      );

      notification.setData(result);
    } catch (e) {
      this.logger.log('error', 'transaction error', { e });
      notification.setCode(GetPublicPostsCodes.TransactionError);
    }
    return notification;
  }
}
