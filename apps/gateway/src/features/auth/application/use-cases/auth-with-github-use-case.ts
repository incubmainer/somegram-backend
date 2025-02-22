import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserFromGithub } from '../../api/dto/input-dto/user-from-github';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { TransactionHost } from '@nestjs-cls/transactional';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { NotificationObject } from '../../../../common/domain/notification';
import { EmailAuthService } from '../../infrastructure/email-auth.service';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';
import { LoggerService } from '@app/logger';

export const LoginWithGithubCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
};

type UserId = string;

export class AuthWithGithubCommand {
  constructor(public user: UserFromGithub) {}
}

@CommandHandler(AuthWithGithubCommand)
export class AuthWithGithubUseCase
  implements ICommandHandler<AuthWithGithubCommand>
{
  constructor(
    private authRepository: UsersRepository,
    private readonly emailAuthService: EmailAuthService,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AuthWithGithubUseCase.name);
  }
  async execute(
    command: AuthWithGithubCommand,
  ): Promise<NotificationObject<UserId>> {
    this.logger.debug('Execute: auth with github ', this.execute.name);
    const notification = new NotificationObject<UserId>(
      LoginWithGithubCodes.Success,
    );
    const { user } = command;
    try {
      await this.txHost.withTransaction(async () => {
        const isExistUser = await this.authRepository.getUserWithGithubInfo(
          user.email,
        );
        if (!isExistUser) {
          const uniqueUsername =
            await this.authRepository.generateUniqueUsername();
          const currentDate = new Date();
          const createdUser =
            await this.authRepository.createConfirmedUserWithGithub(user, {
              username: uniqueUsername,
              email: user.email,
              createdAt: currentDate,
            });
          await this.emailAuthService.successRegistration(user.email);
          return notification.setData(createdUser.id);
        }
        if (isExistUser && isExistUser.userGithubInfo) {
          if (isExistUser.userGithubInfo.email !== user.email) {
            await this.authRepository.changeGithubEmail(isExistUser.id, user);
          }
          return notification.setData(isExistUser.id);
        }
        if (isExistUser && !isExistUser.userGithubInfo) {
          await this.authRepository.addGithubInfo(user, isExistUser.id);
          const userWithGithub = await this.authRepository.getUserByEmail(
            user.email,
          );
          return notification.setData(userWithGithub.id);
        }
      });
    } catch (e) {
      this.logger.error(e, this.execute.name);
      notification.setCode(LoginWithGithubCodes.TransactionError);
    }
    return notification;
  }
}
