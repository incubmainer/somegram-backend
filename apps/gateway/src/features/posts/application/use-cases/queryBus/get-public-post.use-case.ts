import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotificationObject } from '../../../../../common/domain/notification';
import { UsersQueryRepository } from '../../../../users/infrastructure/users.query-repository';

import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';

import { PostsQueryRepository } from '../../../infrastructure/posts.query-repository';
import {
  PostOutputDto,
  postToOutputMapper,
} from '../../../api/dto/output-dto/post.output-dto';
import { PhotoServiceAdapter } from '../../../../../common/adapter/photo-service.adapter';

export const GetPostCodes = {
  Success: Symbol('success'),
  PostNotFound: Symbol('postNotFound'),
  TransactionError: Symbol('transactionError'),
};

export class GetPostQuery {
  constructor(public postId: string) {}
}

@QueryHandler(GetPostQuery)
@LogClass({
  level: 'trace',
  loggerClassField: 'logger',
  active: () => process.env.NODE_ENV !== 'production',
})
export class GetPostUseCase implements IQueryHandler<GetPostQuery> {
  constructor(
    @InjectCustomLoggerService() private readonly logger: CustomLoggerService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
  ) {
    logger.setContext(GetPostUseCase.name);
  }
  async execute(command: GetPostQuery) {
    const { postId } = command;
    const notification = new NotificationObject<PostOutputDto>(
      GetPostCodes.Success,
    );
    try {
      const post = await this.postsQueryRepository.getPostById(postId);
      if (!post) {
        notification.setCode(GetPostCodes.PostNotFound);
        return notification;
      }
      const postOwner = await this.usersQueryRepository.getUserById(
        post.userId,
      );
      const ownerAvatarUrl = await this.photoServiceAdapter.getAvatar(
        post.userId,
      );
      const postPhotos = await this.photoServiceAdapter.getPostPhotos(post.id);

      const postInfo = postToOutputMapper(
        post,
        postOwner,
        ownerAvatarUrl,
        postPhotos,
      );
      notification.setData(postInfo);
    } catch (e) {
      this.logger.log('error', 'transaction error', { e });
      notification.setCode(GetPostCodes.TransactionError);
    }
    return notification;
  }
}
