import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../infrastructure/users.query-repository';
import { User } from '@prisma/gateway';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

export class UploadAvatarCommand {
  constructor(
    public userId: string,
    public file: Express.Multer.File,
  ) {}
}

@CommandHandler(UploadAvatarCommand)
export class UploadAvatarUseCase
  implements
    ICommandHandler<UploadAvatarCommand, AppNotificationResultType<null>>
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(UploadAvatarUseCase.name);
  }

  public async execute(
    command: UploadAvatarCommand,
  ): Promise<AppNotificationResultType<null>> {
    const { userId, file } = command;

    const user: User | null = await this.usersQueryRepository.findUserById(
      command.userId,
    );
    if (!user) return this.appNotification.notFound();

    try {
      await this.photoServiceAdapter.uploadAvatar({
        ownerId: userId,
        file,
      });
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
