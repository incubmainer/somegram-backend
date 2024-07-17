import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserFromGithub } from '../../api/dto/input-dto/user-from-github';
import { UserRepository } from '../../infrastructure/user.repository';
import { AuthService } from '../auth.service';
import { TransactionHost } from '@nestjs-cls/transactional';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Notification } from '../../../../common/domain/notification';

export const LoginWithGithubCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
};

export class AuthWithGithubCommand {
  constructor(public user: UserFromGithub) {}
}

@CommandHandler(AuthWithGithubCommand)
export class AuthWithGithubUseCase
  implements ICommandHandler<AuthWithGithubCommand>
{
  constructor(
    private userRepository: UserRepository,
    private authService: AuthService,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
  ) {}
  async execute(command: AuthWithGithubCommand): Promise<Notification<void>> {
    const notification = new Notification(LoginWithGithubCodes.Success);
    const { user } = command;
    try {
      await this.txHost.withTransaction(async () => {
        const isExistUser = await this.userRepository.getUserWithGithubInfo(
          user.email,
        );
        if (!isExistUser) {
          //заменить эту функцию на метод из репозитория
          function getRandomString() {
            const min = 100;
            const max = 999;
            const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
            return randomNum.toString();
          }

          const uniqueUsername = user.username + getRandomString();
          const currentDate = new Date();
          const createdUser =
            await this.userRepository.createConfirmedUserWithGithub(user, {
              username: uniqueUsername,
              email: user.email,
              createdAt: currentDate,
            });
          // notification.setData(createdUser.id);
          return { username: createdUser.username, id: createdUser.id };
        }
        if (isExistUser && isExistUser.userGithubInfo) {
          if (isExistUser.userGithubInfo.email === user.email) {
            return { username: isExistUser.username, id: isExistUser.id };
          }
          await this.userRepository.changeGithubEmail(isExistUser.id, user);
          return { username: isExistUser.username, id: isExistUser.id };
        }
        if (isExistUser && !isExistUser.userGithubInfo) {
          await this.userRepository.addGithubInfo(user, isExistUser.id);
          const userWithGithub = await this.userRepository.getUserByEmail(
            user.email,
          );
          return { username: userWithGithub.username, id: userWithGithub.id };
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
