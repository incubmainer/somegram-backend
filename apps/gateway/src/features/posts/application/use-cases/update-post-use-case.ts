import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  IsOptional,
  IsString,
  MaxLength,
  validateSync,
  ValidationError,
} from 'class-validator';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';

import { Notification } from '../../../../common/domain/notification';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { UserRepository } from '../../../auth/infrastructure/user.repository';
import { DESC_MAX_LENGTH } from '../../api/dto/update-post.dto';

export const UpdatePostCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
  UserNotFound: Symbol('userNotFound'),
  PostNotFound: Symbol('postNotFound'),
  ValidationCommandError: Symbol('validationCommandError'),
};

export class UpdatePostCommand {
  @IsString()
  public readonly userId: string;
  @IsString()
  public readonly postId: string;
  @IsOptional()
  @IsString()
  @MaxLength(DESC_MAX_LENGTH)
  public readonly description?: string;

  constructor(userId: string, postId: string, description?: string) {
    this.userId = userId;
    this.postId = postId;
    this.description = description;
  }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly postsRepository: PostsRepository,
    private readonly userRepository: UserRepository,
  ) {}
  async execute(
    command: UpdatePostCommand,
  ): Promise<Notification<string[]> | Notification<null, ValidationError>> {
    const errors = validateSync(command);
    if (errors.length) {
      const note = new Notification<null, ValidationError>(
        UpdatePostCodes.ValidationCommandError,
      );
      note.addErrors(errors);
      return note;
    }
    const { userId, postId, description } = command;
    const notification = new Notification<string[]>(UpdatePostCodes.Success);
    try {
      await this.txHost.withTransaction(async () => {
        const isUser = await this.userRepository.findUserById(userId);
        if (!isUser) {
          notification.setCode(UpdatePostCodes.UserNotFound);
          return notification;
        }
        const updateResult = await this.postsRepository.updatePost({
          postId,
          description,
        });
        if (!updateResult) notification.setCode(UpdatePostCodes.PostNotFound);
      });
    } catch (e) {
      if (notification.getCode() === UpdatePostCodes.Success) {
        notification.setCode(UpdatePostCodes.TransactionError);
      }
    }

    return notification;
  }
}
