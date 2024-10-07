import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  validateSync,
  ValidationError,
} from 'class-validator';

import { Notification } from '../../../../common/domain/notification';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { v4 as uuidv4 } from 'uuid';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { UploadAvatarCodes } from '../../../users/application/use-cases/upload-avatar.use-case';
import { Type } from 'class-transformer';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';
import { UnauthorizedException } from '@nestjs/common';

export const DESCRIPTION_MAX_LENGTH = 500;

export const AddPostCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
  ValidationCommandError: Symbol('validationCommandError'),
};

export class AddPostCommand {
  public readonly userId: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  public readonly files: string[];
  @IsOptional()
  @IsString()
  @MaxLength(DESCRIPTION_MAX_LENGTH)
  public readonly description?: string;

  constructor(userId: string, filesKeys: string[], description?: string) {
    this.userId = userId;
    this.files = filesKeys;
    this.description = description;
  }
}

@CommandHandler(AddPostCommand)
export class AddPostUseCase implements ICommandHandler<AddPostCommand> {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly postsRepository: PostsRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}
  async execute(command: AddPostCommand) {
    const errors = validateSync(command);
    if (errors.length) {
      const notification = new Notification<null, ValidationError>(
        UploadAvatarCodes.ValidationCommandError,
      );
      notification.addErrors(errors);
      return notification;
    }
    const { userId, files: filesKeys, description } = command;
    const notification = new Notification<string>(AddPostCodes.Success);
    try {
      await this.txHost.withTransaction(async () => {
        const user = await this.usersQueryRepository.findUserById(userId);
        if (!user) {
          throw new UnauthorizedException();
        }
        const postId = uuidv4();
        const createdAt = new Date();
        const post = await this.postsRepository.addPost({
          postId,
          userId,
          createdAt,
          description,
        });

        for (const fileKey of filesKeys) {
          await this.postsRepository.addInfoAboutPhoto({
            postId,
            photoKey: fileKey,
            createdAt: new Date(),
          });
        }
        notification.setData(post.id);
      });
    } catch {
      notification.setCode(AddPostCodes.TransactionError);
    }
    return notification;
  }
}
