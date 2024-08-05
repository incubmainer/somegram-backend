import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler } from '@nestjs/cqrs';
import { Notification } from 'apps/gateway/src/common/domain/notification';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { IsString, validateSync } from 'class-validator';
import { IsAvatarMimetype } from '../decorators/is-avatar-mimetype';
import { IsAvatar } from '../decorators/is-avatar';
import { AvatarStorageService } from '../../infrastructure/avatar-storage.service';
import { ValidationException } from 'apps/gateway/src/common/domain/validation-error';
import { AvatarRepository } from '../../infrastructure/avatar.repository';

export const UploadAvatarCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
};

export class UploadAvatarCommand {
  @IsString()
  public readonly userId: string;
  @IsAvatar()
  public readonly avatar: Buffer;
  @IsAvatarMimetype()
  public readonly mimeType: string;
  constructor(userId: string, avatar: Buffer, mimeType: string) {
    this.userId = userId;
    this.avatar = avatar;
    this.mimeType = mimeType;
    const errors = validateSync(this);
    if (errors.length) throw new ValidationException(errors);
  }
}

@CommandHandler(UploadAvatarCommand)
export class UploadAvatarUseCase {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly avatarStorageService: AvatarStorageService,
    private readonly avatarRepository: AvatarRepository,
  ) {}

  public async execute(
    command: UploadAvatarCommand,
  ): Promise<Notification<string>> {
    const { userId, avatar, mimeType } = command;
    const notification = new Notification<string>(UploadAvatarCodes.Success);
    try {
      await this.txHost.withTransaction(async () => {
        const currentDate = new Date();
        const previousAvatarKey =
          await this.avatarRepository.getCurrentAvatarKey(userId);
        const urls = await this.avatarStorageService.saveAvatar(
          userId,
          avatar,
          mimeType,
        );
        await this.avatarRepository.setCurrentAvatar({
          userId,
          avatarKey: urls.avatarKey,
          createdAt: currentDate,
        });
        if (previousAvatarKey) {
          await this.avatarStorageService.deleteAvatarByKey(previousAvatarKey);
        }
        notification.setData(urls.avatarUrl);
      });
    } catch (e) {
      if (notification.getCode() === UploadAvatarCodes.Success) {
        notification.setCode(UploadAvatarCodes.TransactionError);
      }
    }
    return notification;
  }
}
