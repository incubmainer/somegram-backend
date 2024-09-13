import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IsString, validateSync, ValidationError } from 'class-validator';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';

import { Notification } from '../../../../common/domain/notification';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { UserRepository } from '../../../auth/infrastructure/user.repository';

export const DeletePostCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
  UserNotFound: Symbol('userNotFound'),
  ValidationCommandError: Symbol('validationCommandError'),
};

export class DeletePostCommand {
  @IsString()
  public readonly userId: string;
  @IsString()
  public readonly postId: string;

  constructor(userId: string, postId: string) {
    this.userId = userId;
    this.postId = postId;
  }
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly postsRepository: PostsRepository,
    private readonly userRepository: UserRepository,
  ) {}
  async execute(
    command: DeletePostCommand,
  ): Promise<Notification<string[]> | Notification<null, ValidationError>> {
    const errors = validateSync(command);
    if (errors.length) {
      const note = new Notification<null, ValidationError>(
        DeletePostCodes.ValidationCommandError,
      );
      note.addErrors(errors);
      return note;
    }
    const { userId, postId } = command;
    const notification = new Notification<string[]>(DeletePostCodes.Success);
    try {
      await this.txHost.withTransaction(async () => {
        const isUser = await this.userRepository.findUserById(userId);
        if (!isUser) {
          notification.setCode(DeletePostCodes.UserNotFound);
          return notification;
        }
        await this.postsRepository.deletePost({
          postId,
        });
      });
    } catch (e) {
      if (notification.getCode() === DeletePostCodes.Success) {
        notification.setCode(DeletePostCodes.TransactionError);
      }
    }

    return notification;
  }
}
