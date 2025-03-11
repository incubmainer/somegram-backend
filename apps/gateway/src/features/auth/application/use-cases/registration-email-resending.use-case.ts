import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';

import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../../settings/configuration/configuration';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { UserEntity } from '../../../users/domain/user.entity';
import { UserConfirmationRepository } from '../../infrastructure/user-confirmation.repository';

export class RegistrationEmailResendingCommand {
  constructor(
    public token: string,
    public html: string,
  ) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase
  implements
    ICommandHandler<
      RegistrationEmailResendingCommand,
      AppNotificationResultType<null, string>
    >
{
  private readonly expireAfterMiliseconds: number;
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly publisher: EventPublisher,
    private readonly userConfirmationRepository: UserConfirmationRepository,
  ) {
    this.expireAfterMiliseconds = this.configService.get('envSettings', {
      infer: true,
    }).EMAIL_CONFIRMATION_TOKEN_EXPIRE_AFTER_MILISECONDS;
    this.logger.setContext(RegistrationEmailResendingUseCase.name);
  }

  public async execute(
    command: RegistrationEmailResendingCommand,
  ): Promise<AppNotificationResultType<null, string>> {
    this.logger.debug(
      'Execute: registration email resending',
      this.execute.name,
    );

    try {
      const { token, html } = command;

      const result = await this.userRepository.getUserByToken(token);
      if (!result) return this.appNotification.notFound();
      const { user, confirmation } = result;
      if (user.isConfirmed || !confirmation)
        return this.appNotification.badRequest('The user is confirmed');

      const confirmationToken = randomUUID().replaceAll('-', '');
      const currentDate = new Date();
      const confirmationTokenExpiredAt = new Date(
        currentDate.getTime() + this.expireAfterMiliseconds,
      );

      confirmation.updateConfirmation(
        confirmationToken,
        confirmationTokenExpiredAt,
      );

      await this.userConfirmationRepository.updateConfirmationByToken(
        confirmation,
        token,
      );

      this.publish(user, confirmationToken, confirmationTokenExpiredAt, html);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  private publish(
    user: UserEntity,
    code: string,
    expiredAt: Date,
    html: string,
  ): void {
    const userWithEvent = this.publisher.mergeObjectContext(user);

    userWithEvent.registrationUserEvent(code, expiredAt, html);
    userWithEvent.commit();
  }
}
