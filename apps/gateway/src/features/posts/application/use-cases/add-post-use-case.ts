import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  IsOptional,
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
import { v4 as uuidv4 } from 'uuid';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { UserRepository } from '../../../auth/infrastructure/user.repository';

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
  @IsOptional()
  @IsString()
  @MaxLength(500)
  public readonly description?: string;

  constructor(
    userId: string,
    postPhoto: Buffer,
    mimeType: string,
    description?: string,
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
    private readonly userRepository: UserRepository,
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
      await this.txHost.withTransaction(async () => {
        const currentDate = new Date();
        const postId = uuidv4();

        const isUser = await this.userRepository.findUserById(userId);
        if (!isUser) {
          notification.setCode(AddPostCodes.UserNotFound);
          return notification;
        }
        const urls = await this.postPhotoStorageService.savePhoto(
          userId,
          postPhoto,
          mimeType,
        );

        await this.postsRepository.addPost({ postId, userId, description });

        await this.postsRepository.addInfoAboutPhoto({
          postId,
          photoKey: urls.photoKey,
          createdAt: currentDate,
        });
        notification.setData(urls.photoUrl);
      });
    } catch (e) {
      if (notification.getCode() === AddPostCodes.Success) {
        notification.setCode(AddPostCodes.TransactionError);
      }
    }
    return notification;
  }
}
