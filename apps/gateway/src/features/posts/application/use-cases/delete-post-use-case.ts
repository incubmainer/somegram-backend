import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '../../../../common/domain/notification';
import { PostsRepository } from '../../infrastructure/posts.repository';

export const DeletePostCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
  UserNotOwner: Symbol('userNotOwner'),
  PostNotFound: Symbol('postNotFound'),
};

export class DeletePostCommand {
  public readonly userId: string;
  public readonly postId: string;

  constructor(postId: string, userId: string) {
    this.userId = userId;
    this.postId = postId;
  }
}
@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}
  async execute(command: DeletePostCommand): Promise<Notification<string[]>> {
    const { postId, userId } = command;
    const notification = new Notification<string[]>(DeletePostCodes.Success);
    const post = await this.postsRepository.findPost(postId);
    if (!post) {
      notification.setCode(DeletePostCodes.PostNotFound);
      return notification;
    }
    if (post.userId !== userId) {
      notification.setCode(DeletePostCodes.UserNotOwner);
      return notification;
    }
    try {
      await this.postsRepository.deletePost({
        postId,
      });
    } catch {
      notification.setCode(DeletePostCodes.TransactionError);
    }
    return notification;
  }
}
