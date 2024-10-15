import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { validateSync, ValidationError } from 'class-validator';

import { Notification } from '../../../../common/domain/notification';
import { PostPhotoStorageService } from '../../infrastructure/post-photo-storage.service';
import { IsValidFile } from '../../../../common/decorators/is-valid-file';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';

export const MAX_PHOTO_SIZE = 20;

export const UploadPhotoCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
  ValidationCommandError: Symbol('validationCommandError'),
};

export class UploadPhotoCommand {
  public readonly userId: string;
  //исправить передавать не полностью файл а уже размер и тип и его валидировать
  @IsValidFile(MAX_PHOTO_SIZE)
  public readonly file: Express.Multer.File;
  constructor(userId: string, file: Express.Multer.File) {
    this.userId = userId;
    this.file = file;
  }
}

@CommandHandler(UploadPhotoCommand)
@LogClass({
  level: 'trace',
  loggerClassField: 'logger',
  active: () => process.env.NODE_ENV !== 'production',
})
export class UploadPhotoUseCase implements ICommandHandler<UploadPhotoCommand> {
  constructor(
    @InjectCustomLoggerService() private readonly logger: CustomLoggerService,
    private readonly postPhotoStorageService: PostPhotoStorageService,
  ) {
    logger.setContext(UploadPhotoUseCase.name);
  }
  async execute(command: UploadPhotoCommand) {
    const errors = validateSync(command);
    if (errors.length) {
      const notification = new Notification<null, ValidationError>(
        UploadPhotoCodes.ValidationCommandError,
      );
      notification.addErrors(errors);
      return notification;
    }
    const { userId, file } = command;

    const notification = new Notification<{
      photoKey: string;
    }>(UploadPhotoCodes.Success);
    try {
      const savedFile = await this.postPhotoStorageService.savePhoto(
        userId,
        file.buffer,
        file.mimetype,
      );
      notification.setData({
        photoKey: savedFile.photoKey,
      });
    } catch (e) {
      this.logger.log('error', 'transaction error', { e });
      notification.setCode(UploadPhotoCodes.TransactionError);
    }
    return notification;
  }
}
