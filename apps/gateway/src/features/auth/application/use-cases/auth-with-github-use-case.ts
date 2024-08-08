import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserFromGithub } from '../../api/dto/input-dto/user-from-github';
import { UserRepository } from '../../infrastructure/user.repository';
import { TransactionHost } from '@nestjs-cls/transactional';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Notification } from '../../../../common/domain/notification';
import { EmailAuthService } from '../../infrastructure/email-auth.service';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';

export const LoginWithGithubCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
};

type UserId = string;

export class AuthWithGithubCommand {
  constructor(public user: UserFromGithub) {}
}

@CommandHandler(AuthWithGithubCommand)
@LogClass({
  level: 'trace',
  loggerClassField: 'logger',
  active: () => process.env.NODE_ENV !== 'production',
})
export class AuthWithGithubUseCase
  implements ICommandHandler<AuthWithGithubCommand>
{
  constructor(
    private userRepository: UserRepository,
    private readonly emailAuthService: EmailAuthService,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    @InjectCustomLoggerService()
    private readonly logger: CustomLoggerService,
  ) {
    logger.setContext(AuthWithGithubUseCase.name);
  }
  async execute(command: AuthWithGithubCommand): Promise<Notification<UserId>> {
    const notification = new Notification<UserId>(LoginWithGithubCodes.Success);
    const { user } = command;
    try {
      await this.txHost.withTransaction(async () => {
        const isExistUser = await this.userRepository.getUserWithGithubInfo(
          user.email,
        );
        if (!isExistUser) {
          const uniqueUsername =
            await this.userRepository.generateUniqueUsername();
          const currentDate = new Date();
          const createdUser =
            await this.userRepository.createConfirmedUserWithGithub(user, {
              username: uniqueUsername,
              email: user.email,
              createdAt: currentDate,
            });
          await this.emailAuthService.successRegistration(user.email);
          return notification.setData(createdUser.id);
        }
        if (isExistUser && isExistUser.userGithubInfo) {
          if (isExistUser.userGithubInfo.email === user.email) {
            return { username: isExistUser.username, id: isExistUser.id };
          }
          await this.userRepository.changeGithubEmail(isExistUser.id, user);
          return notification.setData(isExistUser.id);
        }
        if (isExistUser && !isExistUser.userGithubInfo) {
          await this.userRepository.addGithubInfo(user, isExistUser.id);
          const userWithGithub = await this.userRepository.getUserByEmail(
            user.email,
          );
          notification.setData(userWithGithub.id);
          return;
        }
      });
    } catch (e) {
      if (notification.getCode() === LoginWithGithubCodes.Success) {
        notification.setCode(LoginWithGithubCodes.TransactionError);
      }
    }
    return notification;
  }
}
