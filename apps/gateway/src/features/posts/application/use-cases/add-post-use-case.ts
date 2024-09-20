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
import { PostPhotoStorageService } from '../../infrastructure/post-photo-storage.service';
import { v4 as uuidv4 } from 'uuid';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { Type } from 'class-transformer';
import { FileDto } from '../../api/dto/file.dto';
import { DESC_MAX_LENGTH } from '../../api/dto/post.dto';

export const AddPostCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
  ValidationCommandError: Symbol('validationCommandError'),
};

export class AddPostCommand {
  public readonly userId: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileDto)
  public readonly files: FileDto[];
  @IsOptional()
  @IsString()
  @MaxLength(DESC_MAX_LENGTH)
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
export class AddPostUseCase implements ICommandHandler<AddPostCommand> {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly postPhotoStorageService: PostPhotoStorageService,
    private readonly postsRepository: PostsRepository,
  ) {}
  async execute(command: AddPostCommand) {
    const errors = validateSync(command);
    if (errors.length) {
      const note = new Notification<null, ValidationError>(
        AddPostCodes.ValidationCommandError,
      );
      note.addErrors(errors);
      return note;
    }
    const { userId, files, description } = command;
    const notification = new Notification<{
      id: string;
      userId: string;
      description: string | null;
      images: string[];
    }>(AddPostCodes.Success);
    const allUrls: string[] = [];
    try {
      await this.txHost.withTransaction(async () => {
        const currentDate = new Date();
        const postId = uuidv4();

        const post = await this.postsRepository.addPost({
          postId,
          userId,
          description,
        });
        for (const file of files) {
          const urls = await this.postPhotoStorageService.savePhoto(
            userId,
            file.buffer,
            file.mimetype,
          );
          await this.postsRepository.addInfoAboutPhoto({
            postId,
            photoKey: urls.photoKey,
            createdAt: currentDate,
          });
          allUrls.push(urls.photoUrl);
        }
        notification.setData({ ...post, images: allUrls });
      });
    } catch {
      notification.setCode(AddPostCodes.TransactionError);
    }
    return notification;
  }
}
