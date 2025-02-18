import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IsString, validateSync } from 'class-validator';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';

import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CryptoAuthService } from '../../infrastructure/crypto-auth.service';
import { IsUserPassword } from '../decorators/is-user-password';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';

export const RestorePasswordConfirmationCodes = {
  Success: Symbol('success'),
  InvalidCode: Symbol('Invalid_code'),
  ExpiredCode: Symbol('expired_code'),
  TransactionError: Symbol('transaction_error'),
};

export class RestorePasswordConfirmationCommand {
  @IsString()
  code: string;
  @IsUserPassword()
  password: string;
  constructor(code: string, password: string) {
    this.code = code;
    this.password = password;
    const errors = validateSync(this);
    if (errors.length) throw new Error('Validation failed');
  }
}

@CommandHandler(RestorePasswordConfirmationCommand)
export class RestorePasswordConfirmationUseCase
  implements ICommandHandler<RestorePasswordConfirmationCommand>
{
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly cryptoAuthService: CryptoAuthService,
    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  public async execute(
    command: RestorePasswordConfirmationCommand,
    // @ts-ignore // TODO:
  ): Promise<NotificationObject<void>> {
    // @ts-ignore // TODO
    const notification = new NotificationObject(
      RestorePasswordConfirmationCodes.Success,
    );
    const { code, password } = command;
    try {
      await this.txHost.withTransaction(async () => {
        const currentDate = new Date();
        const user =
          await this.userRepository.getUserByRestorePasswordCode(code);
        if (!user) {
          notification.setCode(RestorePasswordConfirmationCodes.InvalidCode);
          return notification;
        }
        if (!user.resetPasswordCode) {
          notification.setCode(RestorePasswordConfirmationCodes.InvalidCode);
          return notification;
        }
        if (user.resetPasswordCode.expiredAt < currentDate) {
          notification.setCode(RestorePasswordConfirmationCodes.ExpiredCode);
          return notification;
        }
        const hashPassword =
          await this.cryptoAuthService.hashPassword(password);
        await this.userRepository.deleteRestorePasswordCode(user.id);
        await this.userRepository.updateUserPassword(user.id, hashPassword);
        await this.securityDevicesRepository.deleteAllSessionsForUser(user.id);
      });
    } catch {
      notification.setCode(RestorePasswordConfirmationCodes.TransactionError);
    }
    return notification;
  }
}
