import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { Transactional } from '@nestjs-cls/transactional';
import { UserConfirmationRepository } from '../../infrastructure/user-confirmation.repository';

export class RegistrationConfirmationCommand {
  constructor(public token: string) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements
    ICommandHandler<
      RegistrationConfirmationCommand,
      AppNotificationResultType<null, string>
    >
{
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly userConfirmationRepository: UserConfirmationRepository,
  ) {
    this.logger.setContext(RegistrationConfirmationUseCase.name);
  }

  public async execute(
    command: RegistrationConfirmationCommand,
  ): Promise<AppNotificationResultType<null, string>> {
    this.logger.debug(
      'Execute: registration confirmation command',
      this.execute.name,
    );
    const { token } = command;
    try {
      const currentDate: Date = new Date();
      const { user, confirmation } =
        await this.userRepository.getUserByToken(token);

      if (!user || !confirmation) return this.appNotification.notFound();
      if (confirmation.expiredAt < currentDate)
        return this.appNotification.badRequest('Token is expired');

      await this.handleConfirm(user.id, confirmation.token);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  @Transactional()
  private async handleConfirm(userId: string, token: string): Promise<void> {
    await this.userRepository.confirmUser(userId);
    await this.userConfirmationRepository.removeConfirmationByToken(token);
  }
}
