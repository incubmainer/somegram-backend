import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  validateSync,
  ValidationError,
} from 'class-validator';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { UnauthorizedException } from '@nestjs/common';

import { NotificationObject } from '../../../../common/domain/notification';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import {
  FileDto,
  POST_CONSTRAINTS,
} from '../../api/dto/input-dto/add-post.dto';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { LoggerService } from '@app/logger';

const TRANSACTION_TIMEOUT = 50000; //necessary to wait upload all files wihtout timeout error

export const AddPostCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
  ValidationCommandError: Symbol('validationCommandError'),
};

export class AddPostCommand {
  public readonly userId: string;
  @IsArray()
  @ArrayMinSize(POST_CONSTRAINTS.MIN_PHOTO_COUNT)
  @ArrayMaxSize(POST_CONSTRAINTS.MAX_PHOTO_COUNT)
  @ValidateNested({ each: true })
  public readonly files: FileDto[];

  @IsString()
  @MaxLength(POST_CONSTRAINTS.DESCRIPTION_MAX_LENGTH)
  @IsOptional()
  public readonly description?: string;
  constructor(userId: string, files: FileDto[], description?: string) {
    this.userId = userId;
    this.files = files;
    this.description = description;
  }
}

@CommandHandler(AddPostCommand)
// @LogClass({
//   level: 'trace',
//   loggerClassField: 'logger',
//   active: () => process.env.NODE_ENV !== 'production',
// })
export class AddPostUseCase implements ICommandHandler<AddPostCommand> {
  constructor(
    //@InjectCustomLoggerService() private readonly logger: CustomLoggerService,
    private readonly logger: LoggerService,
    private readonly postsRepository: PostsRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
  ) {
    this.logger.setContext(AddPostUseCase.name);
  }
  async execute(command: AddPostCommand) {
    const { userId, files, description } = command;
    const errors = validateSync(command);
    for (const file of command.files) {
      const fileErrors = validateSync(file);
      if (fileErrors.length) {
        errors.push(...fileErrors);
      }
    }
    if (errors.length) {
      const notification = new NotificationObject<null, ValidationError>(
        AddPostCodes.ValidationCommandError,
      );
      notification.addErrors(errors);
      return notification;
    }
    const user = await this.usersQueryRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    const notification = new NotificationObject<string>(AddPostCodes.Success);
    try {
      await this.txHost.withTransaction(
        { timeout: TRANSACTION_TIMEOUT },
        async () => {
          const createdAt = new Date();
          const post = await this.postsRepository.addPost({
            userId,
            createdAt,
            description: description ? description : null,
          });

          for (const file of files) {
            await this.photoServiceAdapter.uploadPostPhoto({
              ownerId: userId,
              postId: post.id,
              file,
            });
          }
          notification.setData(post.id);
        },
      );
    } catch (e) {
      this.logger.error(e, this.execute.name);
      notification.setCode(AddPostCodes.TransactionError);
    }
    return notification;
  }
}
