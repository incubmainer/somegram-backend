import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler } from '@nestjs/cqrs';
import { IsString, validateSync } from 'class-validator';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { randomUUID } from 'crypto';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';

import { NotificationObject } from 'apps/gateway/src/common/domain/notification';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailAuthService } from '../../infrastructure/email-auth.service';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from 'apps/gateway/src/common/config/configs/auth.config';

export const RegistrationEmailResendingCodes = {
  Success: Symbol('success'),
  EmailAlreadyConfirmated: Symbol('email_already_confirmated'),
  UserNotFound: Symbol('user_not_found'),
  TransactionError: Symbol('transaction_error'),
};

export class RegistrationEmailResendingCommand {
  @IsString()
  token: string;
  @IsString()
  html: string;
  constructor(token: string, html: string) {
    this.token = token;
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
  private readonly expireAfterMiliseconds: number;
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly emailAuthService: EmailAuthService,
    private readonly configService: ConfigService,
    @InjectCustomLoggerService() private readonly logger: CustomLoggerService,
  ) {
    const config = this.configService.get<AuthConfig>('auth');
    this.expireAfterMiliseconds =
      config.emailConfirmationTokenExpireAfterMiliseconds;
    logger.setContext(RegistrationEmailResendingUseCase.name);
  }

  public async execute(
    command: RegistrationEmailResendingCommand,
  ): Promise<NotificationObject<void>> {
    this.logger.log('info', 'Registration email resending', {});
    const notification = new NotificationObject(
      RegistrationEmailResendingCodes.Success,
    );
    const { token, html } = command;
    try {
      await this.txHost.withTransaction(async () => {
        const userByToken = await this.userRepository.findUserByToken(token);
        if (!userByToken) {
          notification.setCode(RegistrationEmailResendingCodes.UserNotFound);
          this.logger.log('warn', 'user not found', {
            payload: { token },
          });
          return notification;
        }
        if (userByToken && userByToken.isConfirmed) {
          notification.setCode(
            RegistrationEmailResendingCodes.EmailAlreadyConfirmated,
          );
          this.logger.log('warn', 'email already confirmated', {
            payload: { token },
          });
          return notification;
        }
        const confirmationToken = randomUUID().replaceAll('-', '');
        const currentDate = new Date();
        const confirmationTokenExpiresAt = new Date(
          currentDate.getTime() + this.expireAfterMiliseconds,
        );

        await this.userRepository.updateUserConfirmationInfo({
          userId: userByToken.id,
          createdAt: currentDate,
          confirmationToken,
          confirmationTokenExpiresAt,
        });

        await this.emailAuthService.sendConfirmationEmail({
          name: userByToken.username,
          email: userByToken.email,
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
