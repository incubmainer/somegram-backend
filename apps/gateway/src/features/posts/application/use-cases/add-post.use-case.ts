import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
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
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';
import { UnauthorizedException } from '@nestjs/common';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';

export const DESCRIPTION_MAX_LENGTH = 500;

export const AddPostCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
  ValidationCommandError: Symbol('validationCommandError'),
};

export class AddPostCommand {
  public readonly userId: string;
  @IsArray()
  @IsString({ each: true })
  public readonly filesKeys: string[];
  @IsOptional()
  @IsString()
  @MaxLength(DESCRIPTION_MAX_LENGTH)
  public readonly description?: string;

  constructor(userId: string, filesKeys: string[], description?: string) {
    this.userId = userId;
    this.filesKeys = filesKeys;
    this.description = description;
  }
}

@CommandHandler(AddPostCommand)
@LogClass({
  level: 'trace',
  loggerClassField: 'logger',
  active: () => process.env.NODE_ENV !== 'production',
})
export class AddPostUseCase implements ICommandHandler<AddPostCommand> {
  constructor(
    @InjectCustomLoggerService() private readonly logger: CustomLoggerService,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly postsRepository: PostsRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {
    logger.setContext(AddPostUseCase.name);
  }
  async execute(command: AddPostCommand) {
    const errors = validateSync(command);
    if (errors.length) {
      const notification = new Notification<null, ValidationError>(
        UploadAvatarCodes.ValidationCommandError,
      );
      notification.addErrors(errors);
      return notification;
    }
    const { userId, filesKeys, description } = command;
    const notification = new Notification<string>(AddPostCodes.Success);
    const user =
      await this.usersQueryRepository.findUserWithAvatarInfoById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    try {
      await this.txHost.withTransaction(async () => {
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
    } catch (e) {
      this.logger.log('error', 'transaction error', { e });
      notification.setCode(AddPostCodes.TransactionError);
    }
    return notification;
  }
}
