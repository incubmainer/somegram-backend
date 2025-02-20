import { Transactional } from '@nestjs-cls/transactional';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { AuthService } from '../auth.service';
import { UserEntity } from '../../../users/domain/user.entity';
import { UserResetPasswordRepository } from '../../infrastructure/user-reset-password.repository';

export class RestorePasswordConfirmationCommand {
  constructor(
    public code: string,
    public password: string,
  ) {}
}

@CommandHandler(RestorePasswordConfirmationCommand)
export class RestorePasswordConfirmationUseCase
  implements
    ICommandHandler<
      RestorePasswordConfirmationCommand,
      AppNotificationResultType<null, string>
    >
{
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly securityDevicesRepository: SecurityDevicesRepository,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
    private readonly authService: AuthService,
    private readonly userResetPasswordRepository: UserResetPasswordRepository,
  ) {}

  public async execute(
    command: RestorePasswordConfirmationCommand,
  ): Promise<AppNotificationResultType<null, string>> {
    this.logger.debug(
      'Execute: restore password confirm command',
      this.execute.name,
    );
    const { code, password } = command;

    try {
      const currentDate = new Date();
      const result = await this.userRepository.getUserByResetPasswordCode(code);
      if (!result)
        return this.appNotification.badRequest(
          'Restore password confirmation failed due to Invalid code.',
        );
      const { user, resetPassword } = result;

      if (resetPassword.expiredAt < currentDate)
        return this.appNotification.badRequest(
          'Restore password confirmation failed due to expired code.',
        );

      const hashPassword = await this.authService.generateHash(password);

      user.updatePassword(hashPassword);

      await this.handleUpdatePassword(user, code);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  @Transactional()
  private async handleUpdatePassword(
    user: UserEntity,
    code: string,
  ): Promise<void> {
    await Promise.all([
      this.userRepository.updatePassword(user),
      this.userResetPasswordRepository.removeResetPasswordByCode(code),
      this.securityDevicesRepository.deleteAllSessionsForUser(user.id),
    ]);
  }
}
