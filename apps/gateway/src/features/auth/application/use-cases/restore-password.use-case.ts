import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { ConfigurationType } from '../../../../settings/configuration/configuration';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { UserEntity } from '../../../users/domain/user.entity';
import { UserResetPasswordCreatedDto } from '../../domain/types';
import { UserResetPasswordRepository } from '../../infrastructure/user-reset-password.repository';

export class RestorePasswordCommand {
  constructor(
    public email: string,
    public html: string,
  ) {}
}

@CommandHandler(RestorePasswordCommand)
export class RestorePasswordUseCase
  implements
    ICommandHandler<
      RestorePasswordCommand,
      AppNotificationResultType<null, string>
    >
{
  private readonly expireAfterMiliseconds: number;
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly appNotification: ApplicationNotification,
    private readonly publisher: EventPublisher,
    private readonly logger: LoggerService,
    private readonly userResetPasswordRepository: UserResetPasswordRepository,
  ) {
    this.logger.setContext(RestorePasswordUseCase.name);
    this.expireAfterMiliseconds = this.configService.get('envSettings', {
      infer: true,
    }).RESTORE_PASSWORD_CODE_EXPIRE_AFTER_MILISECONDS;
  }

  public async execute(
    command: RestorePasswordCommand,
  ): Promise<AppNotificationResultType<null, string>> {
    this.logger.debug('Execute: restore password command', this.execute.name);
    const { email, html } = command;

    try {
      const currentDate = new Date();
      const user = await this.userRepository.getUserByEmail(email);
      if (!user) return this.appNotification.notFound();
      const resetPassword =
        await this.userResetPasswordRepository.getResetPasswordByUserId(
          user.id,
        );

      const code = randomUUID().replaceAll('-', '');
      const expiredAt = new Date(
        currentDate.getTime() + this.expireAfterMiliseconds,
      );
      if (resetPassword) {
        const lastCode = resetPassword.code;
        resetPassword.updateResetPassword(code, expiredAt);
        await this.userResetPasswordRepository.updateResetPasswordByCode(
          resetPassword,
          lastCode,
        );
      } else {
        const createdDto: UserResetPasswordCreatedDto = {
          userId: user.id,
          code: code,
          createdAt: currentDate,
          expiredAt: expiredAt,
        };
        await this.userResetPasswordRepository.create(createdDto);
      }

      this.publish(user, code, html);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  private publish(user: UserEntity, code: string, html: string): void {
    const userWithEvents = this.publisher.mergeObjectContext(user);

    userWithEvents.passwordRecoveryEvent(code, html);
    userWithEvents.commit();
  }
}
