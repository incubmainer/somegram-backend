import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  IsString,
  MaxLength,
  validateSync,
  ValidationError,
} from 'class-validator';
import { IsPostPhoto } from '../decorators/is-photo-for-post';
import { IsPhotoMimetype } from '../decorators/is-photo-mime-type';
import { Notification } from 'apps/gateway/src/common/domain/notification';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { PostPhotoStorageService } from '../../infrastructure/post-photo-storage.service';

import { PostsRepository } from '../../infrastructure/posts.repository';

export const AddPostCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
  UserNotFound: Symbol('userNotFound'),
  ValidationCommandError: Symbol('validationCommandError'),
};

export class AddPostCommand {
  @IsString()
  public readonly userId: string;
  @IsPostPhoto()
  public readonly postPhoto: Buffer;
  @IsPhotoMimetype()
  public readonly mimeType: string;
  @MaxLength(500)
  public readonly description: string;

  constructor(
    userId: string,
    postPhoto: Buffer,
    mimeType: string,
    description: string,
  ) {
    this.userId = userId;
    this.postPhoto = postPhoto;
    this.mimeType = mimeType;
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
  async execute(
    command: AddPostCommand,
  ): Promise<Notification<string> | Notification<null, ValidationError>> {
    const errors = validateSync(command);
    if (errors.length) {
      const note = new Notification<null, ValidationError>(
        AddPostCodes.ValidationCommandError,
      );
      note.addErrors(errors);
      return note;
    }
    const { userId, postPhoto, mimeType, description } = command;
    const notification = new Notification<string>(AddPostCodes.Success);
    try {
    } catch (e) {}
  }
}
