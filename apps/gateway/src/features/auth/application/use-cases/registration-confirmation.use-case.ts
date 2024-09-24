import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler } from '@nestjs/cqrs';
import { Notification } from 'apps/gateway/src/common/domain/notification';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { IsString, validateSync } from 'class-validator';

export const RegistrationConfirmationCodes = {
  Success: Symbol('success'),
  TokenExpired: Symbol('tokenExpired'),
  UserNotFound: Symbol('userNotFound'),
  TransactionError: Symbol('transactionError'),
};

export class RegistrationConfirmationCommand {
  @IsString()
  public readonly token: string;
  constructor(token: string) {
    this.token = token;
    const errors = validateSync(this);
    if (errors.length) throw new Error('Validation failed');
  }
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
  ) {}

  public async execute(
    command: RegistrationConfirmationCommand,
  ): Promise<Notification<void>> {
    const notification = new Notification(
      RegistrationConfirmationCodes.Success,
    );
    const { token } = command;
    try {
      await this.txHost.withTransaction(async () => {
        const currentDate = new Date();
        const user = await this.userRepository.findUserByToken(token);
        if (!user) {
          notification.setCode(RegistrationConfirmationCodes.UserNotFound);
          return notification;
        }
        if (user.confirmationToken.expiredAt < currentDate) {
          notification.setCode(RegistrationConfirmationCodes.TokenExpired);
          return notification;
        }
        await this.userRepository.deleteConfirmationToken(token);
        await this.userRepository.confirmUser(user.id);
      });
    } catch {
      notification.setCode(RegistrationConfirmationCodes.TransactionError);
    }
    return notification;
  }
}
