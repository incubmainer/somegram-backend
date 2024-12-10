import { CommandHandler } from '@nestjs/cqrs';
import { IsString, validateSync, ValidationError } from 'class-validator';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';

import { IsValidFile } from '../../../../common/decorators/is-valid-file';
import { UsersQueryRepository } from '../../infrastructure/users.query-repository';
import { NotificationObject } from 'apps/gateway/src/common/domain/notification';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';

export const UploadAvatarCodes = {
  Success: Symbol('success'),
  UserNotFound: Symbol('userNotFound'),
  ValidationCommandError: Symbol('validationCommandError'),
  TransactionError: Symbol('transactionError'),
};

export const MAX_AVATAR_SIZE = 10;

export class UploadAvatarCommand {
  @IsString()
  public readonly userId: string;
  @IsValidFile(MAX_AVATAR_SIZE)
  public readonly file: Express.Multer.File;
  constructor(userId: string, file: Express.Multer.File) {
    this.userId = userId;
    this.file = file;
  }
}

@CommandHandler(UploadAvatarCommand)
@LogClass({
  level: 'trace',
  loggerClassField: 'logger',
  active: () => process.env.NODE_ENV !== 'production',
})
export class UploadAvatarUseCase {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    @InjectCustomLoggerService() private readonly logger: CustomLoggerService,
  ) {
    logger.setContext(UploadAvatarUseCase.name);
  }

  public async execute(
    command: UploadAvatarCommand,
  ): Promise<
    | NotificationObject<null, ValidationError>
    | NotificationObject<null | string>
  > {
    const errors = validateSync(command);
    if (errors.length) {
      const notification = new NotificationObject<null, ValidationError>(
        UploadAvatarCodes.ValidationCommandError,
      );
      notification.addErrors(errors);
      return notification;
    }
    const { userId, file } = command;
    const notification = new NotificationObject<string>(
      UploadAvatarCodes.Success,
    );
    const user = await this.usersQueryRepository.getUserById(command.userId);
    if (!user) {
      notification.setCode(UploadAvatarCodes.UserNotFound);
      return notification;
    }

    try {
      await this.photoServiceAdapter.uploadAvatar({
        ownerId: userId,
        file,
      });
    } catch (e) {
      this.logger.log('error', 'transaction error', { e });
      notification.setCode(UploadAvatarCodes.TransactionError);
    }
    return notification;
  }
}
