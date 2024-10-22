import {
  CommandHandler,
  ICommandHandler,
  IQueryHandler,
  QueryHandler,
} from '@nestjs/cqrs';
import { Notification } from '../../../../common/domain/notification';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';

import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';

import { AvatarStorageService } from '../../../users/infrastructure/avatar-storage.service';
import { PostPhotoStorageService } from '../../infrastructure/post-photo-storage.service';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';
import {
  PostOutputDto,
  postToOutputMapper,
} from '../../api/dto/output-dto/post.output-dto';

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
    private readonly avatarStorageService: AvatarStorageService,
    private readonly postPhotoStorageService: PostPhotoStorageService,
  ) {
    logger.setContext(GetPostUseCase.name);
  }
  async execute(command: GetPostQuery) {
    const { postId } = command;
    const notification = new Notification<PostOutputDto>(GetPostCodes.Success);
    try {
      const post =
        await this.postsQueryRepository.getPostWithPhotosById(postId);
      if (!post) {
        notification.setCode(GetPostCodes.PostNotFound);
        return notification;
      }
      const postOwner =
        await this.usersQueryRepository.findUserWithAvatarInfoById(post.userId);
      let ownerAvatarUrl = null;
      if (postOwner.userAvatar) {
        ownerAvatarUrl = await this.avatarStorageService.getAvatarUrl(
          postOwner.userAvatar.avatarKey,
        );
      }
      const postInfo = postToOutputMapper(
        post,
        postOwner,
        ownerAvatarUrl,
        post.postPhotos.map((postPhoto) =>
          this.postPhotoStorageService.getPhotoUrl(postPhoto.photoKey),
        ),
      );
      notification.setData(postInfo);
    } catch (e) {
      this.logger.log('error', 'transaction error', { e });
      notification.setCode(GetPostCodes.TransactionError);
    }
    return notification;
  }
}
