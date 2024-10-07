import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Notification } from '../../../../common/domain/notification';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';

import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';

import { AvatarStorageService } from '../../../users/infrastructure/avatar-storage.service';
import { AvatarRepository } from '../../../users/infrastructure/avatar.repository';
import { PostPhotoStorageService } from '../../infrastructure/post-photo-storage.service';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';
import {
  PostOutputDto,
  postToOutputMapper,
} from '../../api/dto/output-dto/post.output-dto';

export const GetPostCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
  PostNotFound: Symbol('postNotFound'),
};

export class GetPublicPostCommand {
  constructor(public postId: string) {}
}

@CommandHandler(GetPublicPostCommand)
@LogClass({
  level: 'trace',
  loggerClassField: 'logger',
  active: () => process.env.NODE_ENV !== 'production',
})
export class GetPublicPostUseCase
  implements ICommandHandler<GetPublicPostCommand>
{
  constructor(
    @InjectCustomLoggerService() private readonly logger: CustomLoggerService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly avatarRepository: AvatarRepository,
    private readonly avatarStorageService: AvatarStorageService,
    private readonly postPhotoStorageService: PostPhotoStorageService,
  ) {
    logger.setContext(GetPublicPostUseCase.name);
  }
  async execute(command: GetPublicPostCommand) {
    const { postId } = command;
    const notification = new Notification<PostOutputDto>(GetPostCodes.Success);
    try {
      const post = await this.postsQueryRepository.findPost(postId);
      if (!post) {
        notification.setCode(GetPostCodes.PostNotFound);
        return notification;
      }
      const postOwner = await this.usersQueryRepository.findUserById(
        post.userId,
      );
      const ownerAvatarKey = await this.avatarRepository.getAvatarKeyByUserId(
        postOwner.id,
      );
      const ownerAvatar =
        await this.avatarStorageService.getAvatarUrl(ownerAvatarKey);
      const postPhotosInfo = await this.postsQueryRepository.getPostPhotosInfo(
        post.id,
      );
      let photosUrls;
      if (postPhotosInfo) {
        photosUrls = postPhotosInfo.map((postPhoto) =>
          this.postPhotoStorageService.getPhotoUrl(postPhoto.photoKey),
        );
      }

      const postInfo = postToOutputMapper(
        post,
        postOwner,
        ownerAvatar,
        photosUrls,
      );
      notification.setData(postInfo);
    } catch {
      notification.setCode(GetPostCodes.TransactionError);
    }
    return notification;
  }
}
