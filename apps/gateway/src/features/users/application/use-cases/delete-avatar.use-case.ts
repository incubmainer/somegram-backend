import { CommandHandler } from '@nestjs/cqrs';

import { NotificationObject } from 'apps/gateway/src/common/domain/notification';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';
import { UsersQueryRepository } from '../../infrastructure/users.query-repository';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { LoggerService } from '@app/logger';

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
// @LogClass({
//   level: 'trace',
//   loggerClassField: 'logger',
//   active: () => process.env.NODE_ENV !== 'production',
// })
export class DeleteAvatarUseCase {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    // @InjectCustomLoggerService() private readonly logger: CustomLoggerService,
    private readonly logger: LoggerService,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
  ) {
    this.logger.setContext(DeleteAvatarUseCase.name);
  }

  public async execute(
    command: DeleteAvatarCommand,
  ): Promise<NotificationObject<null | string>> {
    const { userId } = command;
    const notification = new NotificationObject<string>(
      DeleteAvatarCodes.Success,
    );
    const user = await this.usersQueryRepository.findUserById(command.userId);
    if (!user) {
      notification.setCode(DeleteAvatarCodes.UserNotFound);
      return notification;
    }
    try {
      const result = await this.photoServiceAdapter.deleteAvatar(userId);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      notification.setCode(DeleteAvatarCodes.TransactionError);
    }
    return notification;
  }
}
