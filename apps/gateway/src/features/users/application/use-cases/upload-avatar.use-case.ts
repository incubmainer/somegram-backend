import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { UsersRepository } from '../../infrastructure/users.repository';

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
    private readonly usersRepository: UsersRepository,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(UploadAvatarUseCase.name);
  }

  public async execute(
    command: UploadAvatarCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug('Execute: upload user avatar command', this.execute.name);
    const { userId, file } = command;

    try {
      const user = await this.usersRepository.getUserById(userId);
      if (!user) return this.appNotification.notFound();
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
