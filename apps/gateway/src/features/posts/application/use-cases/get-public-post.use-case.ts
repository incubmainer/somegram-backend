import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Notification } from '../../../../common/domain/notification';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';
import { PostPhotoStorageService } from '../../infrastructure/post-photo-storage.service';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';
import { UpdatePostCodes } from './update-post.use-case';
import {
  PostOutputDto,
  postToOutputMapper,
} from '../../api/dto/output-dto/post.output-dto';
import { AvatarRepository } from '../../../users/infrastructure/avatar.repository';
import { AvatarStorageService } from '../../../users/infrastructure/avatar-storage.service';

export const GetPostCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
  PostNotFound: Symbol('postNotFound'),
};

export class GetPublicPostCommand {
  constructor(public postId: string) {}
}

@QueryHandler(GetPublicPostCommand)
export class PublicPostGetUseCase
  implements IQueryHandler<GetPublicPostCommand>
{
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly avatarRepository: AvatarRepository,
    private readonly avatarStorageService: AvatarStorageService,
    private readonly postPhotoStorageService: PostPhotoStorageService,
  ) {}

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

      const photosUrls = postPhotosInfo.map((postPhoto) =>
        this.postPhotoStorageService.getPhotoUrl(postPhoto.photoKey),
      );
      const postInfo = postToOutputMapper(
        post,
        postOwner,
        ownerAvatar,
        photosUrls,
      );
      notification.setData(postInfo);
    } catch {
      notification.setCode(UpdatePostCodes.TransactionError);
    }
    return notification;
  }
}
