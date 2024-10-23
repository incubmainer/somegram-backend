import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  validateSync,
  ValidationError,
} from 'class-validator';
import * as sharp from 'sharp';
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
import { PostPhotoStorageService } from '../../infrastructure/post-photo-storage.service';
import { PostPhotoRepository } from '../../infrastructure/post-photos.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';
import { PostsRepository } from '../../infrastructure/posts.repository';

export const POST_CONSTRAINTS = {
  MAX_PHOTO_COUNT: 10,
  MAX_PHOTO_SIZE: 20,
  DESCRIPTION_MAX_LENGTH: 500,
  ALLOWED_MIMETYPES: ['image/jpeg', 'image/png'],
};
const TRANSACTION_TIMEOUT = 50000; //necessary to wait upload all files wihtout timeout error

export const AddPostCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
  ValidationCommandError: Symbol('validationCommandError'),
};

export class AddPostCommand {
  public readonly userId: string;
  @IsArray()
  @ArrayMaxSize(POST_CONSTRAINTS.MAX_PHOTO_COUNT)
  @ValidateNested({ each: true })
  public readonly files: Express.Multer.File[];

  @IsString()
  @MaxLength(POST_CONSTRAINTS.DESCRIPTION_MAX_LENGTH)
  @IsOptional()
  public readonly description?: string;
  constructor(
    userId: string,
    files: Express.Multer.File[],
    description?: string,
  ) {
    this.userId = userId;
    this.files = files;
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
    private readonly postPhotoStorageService: PostPhotoStorageService,
    private readonly postPhotoRepository: PostPhotoRepository,
    private readonly postsRepository: PostsRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
  ) {
    logger.setContext(AddPostUseCase.name);
  }
  async execute(command: AddPostCommand) {
    const { userId, files, description } = command;
    const errors = validateSync(command);
    for (const file of files) {
      if (file.size > POST_CONSTRAINTS.MAX_PHOTO_SIZE * 1024 * 1024) {
        errors.push({
          property: `${file.originalname}`,
          constraints: {
            fileSize: `File size must not exceed ${POST_CONSTRAINTS.MAX_PHOTO_SIZE} MB`,
          },
        });
      }
      if (!POST_CONSTRAINTS.ALLOWED_MIMETYPES.includes(file.mimetype)) {
        errors.push({
          property: `${file.originalname}`,
          constraints: {
            memetype: `Mimetype must be one of the following: ${POST_CONSTRAINTS.ALLOWED_MIMETYPES.join(', ')}`,
          },
        });
      }
    }
    if (errors.length) {
      const notification = new NotificationObject<null, ValidationError>(
        AddPostCodes.ValidationCommandError,
      );
      notification.addErrors(errors);
      return notification;
    }
    const user =
      await this.usersQueryRepository.findUserWithAvatarInfoById(userId);
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
            const savedFile = await this.postPhotoStorageService.savePhoto(
              userId,
              post.id,
              file.buffer,
              file.mimetype,
            );
            const metadata = await sharp(file.buffer).metadata();
            await this.postPhotoRepository.addInfoAboutUploadedPhoto({
              userId,
              postId: post.id,
              photoKey: savedFile.photoKey,
              createdAt,
              width: metadata.width,
              height: metadata.height,
              size: metadata.size,
            });
          }
          notification.setData(post.id);
        },
      );
    } catch (e) {
      this.logger.log('error', 'transaction error', { e });
      notification.setCode(AddPostCodes.TransactionError);
    }
    return notification;
  }
}
