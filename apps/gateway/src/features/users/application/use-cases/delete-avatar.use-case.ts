import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { UsersRepository } from '../../infrastructure/users.repository';

export class DeleteAvatarCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteAvatarCommand)
export class DeleteAvatarUseCase
  implements
    ICommandHandler<DeleteAvatarCommand, AppNotificationResultType<null>>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly logger: LoggerService,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(DeleteAvatarUseCase.name);
  }

  public async execute(
    command: DeleteAvatarCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug(
      'Execute: delete avatar by user id command',
      this.execute.name,
    );

    const { userId } = command;

    try {
      const user = await this.usersRepository.getUserById(command.userId);
      if (!user) return this.appNotification.notFound();
      await this.photoServiceAdapter.deleteAvatar(userId);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
