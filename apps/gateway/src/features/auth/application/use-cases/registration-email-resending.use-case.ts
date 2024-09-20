import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler } from '@nestjs/cqrs';
import { IsEmail, IsString, validateSync } from 'class-validator';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { randomUUID } from 'crypto';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';

import { Notification } from 'apps/gateway/src/common/domain/notification';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailAuthService } from '../../infrastructure/email-auth.service';

export const RegistrationEmailResendingCodes = {
  Success: Symbol('success'),
  EmailAlreadyConfirmated: Symbol('email_already_confirmated'),
  UserNotFound: Symbol('user_not_found'),
  TransactionError: Symbol('transaction_error'),
};

export class RegistrationEmailResendingCommand {
  @IsEmail()
  public readonly email: string;
  @IsString()
  html: string;
  constructor(email: string, html: string) {
    this.email = email;
    this.html = html;
    const errors = validateSync(this);
    if (errors.length) throw new Error('Validation failed');
  }
}

@LogClass({
  level: 'trace',
  loggerClassField: 'logger',
  active: () => process.env.NODE_ENV !== 'production',
})
@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly emailAuthService: EmailAuthService,
    @InjectCustomLoggerService() private readonly logger: CustomLoggerService,
  ) {
    logger.setContext(RegistrationEmailResendingUseCase.name);
  }

  public async execute(
    command: RegistrationEmailResendingCommand,
  ): Promise<Notification<void>> {
    this.logger.log('info', 'Registration email resending', {});
    const notification = new Notification(
      RegistrationEmailResendingCodes.Success,
    );
    const { email, html } = command;
    try {
      await this.txHost.withTransaction(async () => {
        const userByEmail = await this.userRepository.getUserByEmail(email);
        if (!userByEmail) {
          notification.setCode(RegistrationEmailResendingCodes.UserNotFound);
          this.logger.log('warn', 'user not found', {
            payload: { email },
          });
          return notification;
        }
        if (userByEmail && userByEmail.isConfirmed) {
          notification.setCode(
            RegistrationEmailResendingCodes.EmailAlreadyConfirmated,
          );
          this.logger.log('warn', 'email already confirmated', {
            payload: { email },
          });
          return notification;
        }
        const confirmationToken = randomUUID().replaceAll('-', '');
        const hoursExpires = 24;
        const currentDate = new Date();
        const confirmationTokenExpiresAt = new Date(
          currentDate.getTime() + 1000 * 60 * 60 * hoursExpires,
        );

        await this.userRepository.updateUserConfirmationInfo({
          userId: userByEmail.id,
          createdAt: currentDate,
          confirmationToken,
          confirmationTokenExpiresAt,
        });

        await this.emailAuthService.sendConfirmationEmail({
          name: userByEmail.username,
          email,
          expiredAt: confirmationTokenExpiresAt,
          confirmationToken,
          html,
        });
        this.logger.log('info', 'Email sended success', {});
      });
    } catch {
      this.logger.log('error', 'transaction error', {});
      notification.setCode(RegistrationEmailResendingCodes.TransactionError);
    }
    return notification;
  }
}
