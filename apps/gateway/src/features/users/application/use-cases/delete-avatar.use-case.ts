import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler } from '@nestjs/cqrs';
import { NotificationObject } from 'apps/gateway/src/common/domain/notification';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { AvatarStorageService } from '../../infrastructure/avatar-storage.service';
import { AvatarRepository } from '../../infrastructure/avatar.repository';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';
import { UsersQueryRepository } from '../../infrastructure/users.query-repository';

export const DeleteAvatarCodes = {
  Success: Symbol('success'),
  UserNotFound: Symbol('userNotFound'),
  TransactionError: Symbol('transactionError'),
};

export class DeleteAvatarCommand {
  public readonly userId: string;
  constructor(userId: string) {
    this.userId = userId;
  }
}

@CommandHandler(DeleteAvatarCommand)
@LogClass({
  level: 'trace',
  loggerClassField: 'logger',
  active: () => process.env.NODE_ENV !== 'production',
})
export class DeleteAvatarUseCase {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly avatarStorageService: AvatarStorageService,
    private readonly avatarRepository: AvatarRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    @InjectCustomLoggerService() private readonly logger: CustomLoggerService,
  ) {
    logger.setContext(DeleteAvatarUseCase.name);
  }

  public async execute(
    command: DeleteAvatarCommand,
  ): Promise<NotificationObject<null | string>> {
    const { userId } = command;
    const notification = new NotificationObject<string>(
      DeleteAvatarCodes.Success,
    );
    const user = await this.usersQueryRepository.findUserWithAvatarInfoById(
      command.userId,
    );
    if (!user) {
      notification.setCode(DeleteAvatarCodes.UserNotFound);
      return notification;
    }
    try {
      await this.txHost.withTransaction(async () => {
        const avatarKey =
          await this.avatarRepository.getAvatarKeyByUserId(userId);
        if (avatarKey) {
          await this.avatarStorageService.deleteAvatarByKey(avatarKey);
          await this.avatarRepository.deleteAvatarKeyByUserId(userId);
        }
      });
    } catch (e) {
      this.logger.log('error', 'transaction error', { e });
      notification.setCode(DeleteAvatarCodes.TransactionError);
    }
    return notification;
  }
}
