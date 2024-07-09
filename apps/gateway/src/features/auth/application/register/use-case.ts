import { CommandHandler } from '@nestjs/cqrs';
import { User } from '../../domain/user';
import { UserId } from '../../domain/value-objects/user-id';
import { UserRepository } from '../../domain/user.repository';
import { Notification } from '../../../../common/domain/notification';
import { CryptoAuthService } from '../../domain/crypto-auth.service';
import { RegisterCommand } from './command';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';

export const RegisterCodes = {
  Success: Symbol('success'),
  EmailAlreadyExists: Symbol('email_already_exists'),
  UsernameAlreadyExists: Symbol('username_already_exists'),
  TransactionError: Symbol('transaction_error'),
};

@CommandHandler(RegisterCommand)
export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cryptoAuthService: CryptoAuthService,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
  ) { }

  public async execute(
    command: RegisterCommand,
  ): Promise<Notification<UserId>> {
    const notification = new Notification<UserId>(RegisterCodes.Success);
    const { username, email, password } = command;

    let user: User;

    try {
      await this.txHost.withTransaction(async () => {
        const isUniqueEmail = await this.userRepository.isUniqueEmail(email);
        if (!isUniqueEmail) {
          notification.setCode(RegisterCodes.EmailAlreadyExists);
          throw new Error('Email already exists');
        }
        const isUniqueUsername =
          await this.userRepository.isUniqueUsername(username);
        if (!isUniqueUsername) {
          notification.setCode(RegisterCodes.UsernameAlreadyExists);
          throw new Error('Username already exists');
        }
        const userId = this.userRepository.generateId();
        const hashPassword =
          await this.cryptoAuthService.hashPassword(password);
        const confirmationToken =
          this.cryptoAuthService.generateConfirmationToken();
        user = User.registrate(
          userId,
          username,
          email,
          hashPassword,
          confirmationToken,
        );

        await this.userRepository.save(user);
        notification.setData(user.id);
      });
    } catch (e) {
      console.log(e);
      if (notification.getCode() === RegisterCodes.Success)
        notification.setCode(RegisterCodes.TransactionError);
    }
    if (notification.getCode() === RegisterCodes.Success) user.commit();
    return notification;
  }
}
