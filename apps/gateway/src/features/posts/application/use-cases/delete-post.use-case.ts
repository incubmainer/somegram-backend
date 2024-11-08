import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { NotificationObject } from '../../../../common/domain/notification';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';

export const DeletePostCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
  UserNotOwner: Symbol('userNotOwner'),
  PostNotFound: Symbol('postNotFound'),
};

export class DeletePostCommand {
  public readonly postId: string;
  public readonly userId: string;

  constructor(postId: string, userId: string) {
    this.postId = postId;
    this.userId = userId;
  }
}
@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
  ) {}
  async execute(
    command: DeletePostCommand,
  ): Promise<NotificationObject<string[]>> {
    const { postId, userId } = command;
    const notification = new NotificationObject<string[]>(
      DeletePostCodes.Success,
    );
    const post = await this.postsRepository.getPostById(postId);
    if (!post) {
      notification.setCode(DeletePostCodes.PostNotFound);
      return notification;
    }
    if (post.userId !== userId) {
      notification.setCode(DeletePostCodes.UserNotOwner);
      return notification;
    }
    try {
      await this.photoServiceAdapter.deletePostPhotos(postId);
      await await this.postsRepository.deletePost({
        postId,
      });
    } catch {
      notification.setCode(DeletePostCodes.TransactionError);
    }
    return notification;
  }
}
