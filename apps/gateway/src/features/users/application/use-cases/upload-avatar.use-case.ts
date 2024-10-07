import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler } from '@nestjs/cqrs';
import { Notification } from 'apps/gateway/src/common/domain/notification';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { IsString, validateSync, ValidationError } from 'class-validator';
import { AvatarStorageService } from '../../infrastructure/avatar-storage.service';
import { AvatarRepository } from '../../infrastructure/avatar.repository';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';
import { IsValidFile } from '../../../../common/decorators/is-valid-file';
import { UsersQueryRepository } from '../../infrastructure/users.query-repository';

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
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly avatarStorageService: AvatarStorageService,
    private readonly avatarRepository: AvatarRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    @InjectCustomLoggerService() private readonly logger: CustomLoggerService,
  ) {
    logger.setContext(UploadAvatarUseCase.name);
  }

  public async execute(
    command: UploadAvatarCommand,
  ): Promise<
    Notification<null, ValidationError> | Notification<null | string>
  > {
    const errors = validateSync(command);
    if (errors.length) {
      const notification = new Notification<null, ValidationError>(
        UploadAvatarCodes.ValidationCommandError,
      );
      notification.addErrors(errors);
      return notification;
    }
    const { userId, file } = command;
    const notification = new Notification<string>(UploadAvatarCodes.Success);
    const user = await this.usersQueryRepository.findUserById(command.userId);
    if (!user) {
      notification.setCode(UploadAvatarCodes.UserNotFound);
      return notification;
    }
    try {
      await this.txHost.withTransaction(async () => {
        const currentDate = new Date();
        const previousAvatarKey =
          await this.avatarRepository.getAvatarKeyByUserId(userId);
        if (previousAvatarKey) {
          await this.avatarStorageService.deleteAvatarByKey(previousAvatarKey);
        }
        const urls = await this.avatarStorageService.saveAvatar(
          userId,
          file.buffer,
          file.mimetype,
        );
        await this.avatarRepository.setCurrentAvatar({
          userId,
          avatarKey: urls.avatarKey,
          createdAt: currentDate,
        });
      });
    } catch (e) {
      this.logger.log('error', 'transaction error', { e });
      notification.setCode(UploadAvatarCodes.TransactionError);
    }
    return notification;
  }
}
