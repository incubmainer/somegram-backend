import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Notification } from '../../../../common/domain/notification';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';

import { AvatarStorageService } from '../../../users/infrastructure/avatar-storage.service';
import { PostPhotoStorageService } from '../../infrastructure/post-photo-storage.service';
import {
  PostOutputDto,
  postToOutputMapper,
} from '../../api/dto/output-dto/post.output-dto';
import { Paginator } from 'apps/gateway/src/common/domain/paginator';
import { getSanitizationQuery } from 'apps/gateway/src/common/utils/query-params.sanitizator';
import { SearchQueryParametersType } from 'apps/gateway/src/common/domain/query.types';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';

export const GetPostsCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
};

export class GetPostsCommand {
  constructor(
    public userId: string,
    public queryString?: SearchQueryParametersType,
  ) {}
}

@CommandHandler(GetPostsCommand)
@LogClass({
  level: 'trace',
  loggerClassField: 'logger',
  active: () => process.env.NODE_ENV !== 'production',
})
export class GetPostsUseCase implements ICommandHandler<GetPostsCommand> {
  constructor(
    @InjectCustomLoggerService() private readonly logger: CustomLoggerService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly avatarStorageService: AvatarStorageService,
    private readonly postPhotoStorageService: PostPhotoStorageService,
  ) {
    logger.setContext(GetPostsUseCase.name);
  }
  async execute(command: GetPostsCommand) {
    const { userId, queryString } = command;
    const notification = new Notification<Paginator<PostOutputDto[]>>(
      GetPostsCodes.Success,
    );
    const sanitizationQuery = getSanitizationQuery(queryString);
    const offset =
      (sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize;
    try {
      const user =
        await this.usersQueryRepository.findUserWithAvatarInfoById(userId);
      const avatarUrl = await this.avatarStorageService.getAvatarUrl(
        user.userAvatar.avatarKey,
      );
      const { posts, count } =
        await this.postsQueryRepository.getPostsWithPhotos(
          user.id,
          offset,
          sanitizationQuery.pageSize,
        );

      const mappedPosts = posts.map((post) => {
        return postToOutputMapper(
          post,
          user,
          avatarUrl,
          post.postPhotos.map((photo) =>
            this.postPhotoStorageService.getPhotoUrl(photo.photoKey),
          ),
        );
      });

      const result = new Paginator<PostOutputDto[]>(
        sanitizationQuery.pageNumber,
        sanitizationQuery.pageSize,
        count,
        mappedPosts,
      );

      notification.setData(result);
    } catch (e) {
      this.logger.log('error', 'transaction error', { e });
      notification.setCode(GetPostsCodes.TransactionError);
    }
    return notification;
  }
}
