import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  IsOptional,
  IsString,
  MaxLength,
  validateSync,
  ValidationError,
} from 'class-validator';

import { Notification } from '../../../../common/domain/notification';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { POST_CONSTRAINTS } from './add-post.use-case';

export const UpdatePostCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
  PostNotFound: Symbol('postNotFound'),
  UserNotOwner: Symbol('userNotOwner'),
  ValidationCommandError: Symbol('validationCommandError'),
};

export class UpdatePostCommand {
  public readonly postId: string;
  public readonly userId: string;
  @IsOptional()
  @IsString()
  @MaxLength(POST_CONSTRAINTS.DESCRIPTION_MAX_LENGTH)
  public readonly description?: string;

  constructor(postId: string, userId: string, description?: string) {
    this.userId = userId;
    this.postId = postId;
    this.description = description;
  }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}
  async execute(
    command: UpdatePostCommand,
  ): Promise<Notification<string> | Notification<null, ValidationError>> {
    const errors = validateSync(command);
    if (errors.length) {
      const note = new Notification<null, ValidationError>(
        UpdatePostCodes.ValidationCommandError,
      );
      note.addErrors(errors);
      return note;
    }
    const { postId, userId, description } = command;
    const notification = new Notification<string>(UpdatePostCodes.Success);
    try {
      const post = await this.postsRepository.getPostWithPhotosById(postId);
      if (!post) {
        notification.setCode(UpdatePostCodes.PostNotFound);
        return notification;
      }
      if (post.userId !== userId) {
        notification.setCode(UpdatePostCodes.UserNotOwner);
        return notification;
      }
      await this.postsRepository.updatePost({
        postId,
        description,
        updatedAt: new Date(),
      });
    } catch {
      notification.setCode(UpdatePostCodes.TransactionError);
    }
    return notification;
  }
}
