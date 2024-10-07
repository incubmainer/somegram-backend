import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { validateSync, ValidationError } from 'class-validator';

import { Notification } from '../../../../common/domain/notification';
import { PostPhotoStorageService } from '../../infrastructure/post-photo-storage.service';
import { IsValidFile } from '../../../users/application/decorators/is-valid-file';
import { UploadAvatarCodes } from '../../../users/application/use-cases/upload-avatar.use-case';

export const MAX_PHOTO_SIZE = 20;

export const UploadPostCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
  ValidationCommandError: Symbol('validationCommandError'),
};

export class UploadPhotoCommand {
  public readonly userId: string;
  @IsValidFile(MAX_PHOTO_SIZE)
  public readonly file: Express.Multer.File;
  constructor(userId: string, file: Express.Multer.File) {
    this.userId = userId;
    this.file = file;
  }
}

@CommandHandler(UploadPhotoCommand)
export class UploadPhotoUseCase implements ICommandHandler<UploadPhotoCommand> {
  constructor(
    private readonly postPhotoStorageService: PostPhotoStorageService,
  ) {}
  async execute(command: UploadPhotoCommand) {
    const errors = validateSync(command);
    if (errors.length) {
      const notification = new Notification<null, ValidationError>(
        UploadAvatarCodes.ValidationCommandError,
      );
      notification.addErrors(errors);
      return notification;
    }
    const { userId, file } = command;

    const notification = new Notification<string>(UploadPostCodes.Success);
    try {
      const savedFile = await this.postPhotoStorageService.savePhoto(
        userId,
        file.buffer,
        file.mimetype,
      );
      notification.setData(savedFile.photoKey);
    } catch {
      notification.setCode(UploadPostCodes.TransactionError);
    }
    return notification;
  }
}
