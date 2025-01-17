import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  PrismaClient as GatewayPrismaClient,
  User,
  UserConfirmationToken,
} from '@prisma/gateway';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';

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
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
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
      return await this.txHost.withTransaction(async () => {
        const currentDate: Date = new Date();
        const user: User & { confirmationToken: UserConfirmationToken } =
          await this.userRepository.findUserByToken(token);
        if (!user) return this.appNotification.notFound();

        if (user.confirmationToken.expiredAt < currentDate)
          return this.appNotification.badRequest('Token is expired');

        await this.userRepository.deleteConfirmationToken(token);
        await this.userRepository.confirmUser(user.id);

        return this.appNotification.success(null);
      });
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
