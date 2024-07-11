import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler } from '@nestjs/cqrs';
import { Notification } from 'apps/gateway/src/common/domain/notification';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { UserRepository } from '../../infrastructure/user.repository';
import { CryptoAuthService } from '../../infrastructure/crypto-auth.service';
import { EmailAuthService } from '../../infrastructure/email-auth.service';
import { IsString, validateSync } from 'class-validator';

export const RestorePasswordCodes = {
  Success: Symbol('success'),
  CodeInvalid: Symbol('invalid_restore_password_code'),
  TransactionError: Symbol('transaction_error'),
};

export class RestorePasswordCommand {
  @IsString()
  public readonly code: string;
  constructor(code: string) {
    this.code = code;
    const errors = validateSync(this);
    if (errors.length) throw new Error('Validation failed');
  }
}

@CommandHandler(RestorePasswordCommand)
export class RegistrationUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly cryptoAuthService: CryptoAuthService,
    private readonly emailAuthService: EmailAuthService,
  ) { }

  public async execute(
    command: RestorePasswordCommand,
  ): Promise<Notification<void>> {
    const notification = new Notification(RestorePasswordCodes.Success);
    const { code } = command;
    try {
      await this.txHost.withTransaction(async () => {
        const currentDate = new Date();
        const user =
          await this.userRepository.getUserByRestorePasswordCode(code);
      });
    } catch (e) {
      if (notification.getCode() === RestorePasswordCodes.Success) {
        notification.setCode(RestorePasswordCodes.TransactionError);
      }
    }
    return notification;
  }
}
