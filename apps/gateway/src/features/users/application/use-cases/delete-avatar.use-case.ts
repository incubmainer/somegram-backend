import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../infrastructure/users.query-repository';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { User } from '@prisma/gateway';

export class DeleteAvatarCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteAvatarCommand)
export class DeleteAvatarUseCase
  implements
    ICommandHandler<DeleteAvatarCommand, AppNotificationResultType<null>>
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly logger: LoggerService,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(DeleteAvatarUseCase.name);
  }

  public async execute(
    command: DeleteAvatarCommand,
  ): Promise<AppNotificationResultType<null>> {
    const { userId } = command;

    const user: User | null = await this.usersQueryRepository.findUserById(
      command.userId,
    );
    if (!user) return this.appNotification.notFound();

    try {
      await this.photoServiceAdapter.deleteAvatar(userId);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
