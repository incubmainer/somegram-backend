import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { IsEmail, IsString, validateSync } from 'class-validator';
import { ConfigService } from '@nestjs/config';

import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CryptoAuthService } from '../../infrastructure/crypto-auth.service';
import { EmailAuthService } from '../../infrastructure/email-auth.service';
import { AuthConfig } from 'apps/gateway/src/common/config/configs/auth.config';
import { RecapchaService } from 'apps/gateway/src/common/utils/recapcha.service';
import { Notification } from 'apps/gateway/src/common/domain/notification';

export const RestorePasswordCodes = {
  Success: Symbol('success'),
  UserNotFound: Symbol('user_not_found'),
  UnvalidRecaptcha: Symbol('unvalid_recaptcha'),
  TransactionError: Symbol('transaction_error'),
};

export class RestorePasswordCommand {
  @IsEmail()
  email: string;
  @IsString()
  recaptchaToken: string;
  @IsString()
  html: string;
  constructor(email: string, recaptchaToken: string, html: string) {
    this.email = email;
    this.recaptchaToken = recaptchaToken;
    this.html = html;
    const errors = validateSync(this);
    if (errors.length) throw new Error('Validation failed');
  }
}

@CommandHandler(RestorePasswordCommand)
export class RestorePasswordUseCase {
  private readonly expireAfterMiliseconds: number;
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly cryptoAuthService: CryptoAuthService,
    private readonly emailAuthService: EmailAuthService,
    private readonly configService: ConfigService,
    private readonly recapchaService: RecapchaService,
  ) {
    const config = this.configService.get<AuthConfig>('auth');
    this.expireAfterMiliseconds =
      config.restorePasswordCodeExpireAfterMiliseconds;
  }

  public async execute(
    command: RestorePasswordCommand,
  ): Promise<Notification<void>> {
    const notification = new Notification(RestorePasswordCodes.Success);
    const { email, recaptchaToken } = command;
    const isValidRecaptcha =
      await this.recapchaService.verifyRecaptchaToken(recaptchaToken);
    if (!isValidRecaptcha) {
      notification.setCode(RestorePasswordCodes.UnvalidRecaptcha);
      return notification;
    }
    try {
      await this.txHost.withTransaction(async () => {
        const currentDate = new Date();
        const user = await this.userRepository.getUserByEmail(email);
        if (!user) {
          notification.setCode(RestorePasswordCodes.UserNotFound);
          return notification;
        }
        const code = randomUUID().replaceAll('-', '');
        await this.userRepository.updateRestorePasswordCode({
          userId: user.id,
          restorePasswordCode: code,
          restorePasswordCodeCreatedAt: currentDate,
          restorePasswordCodeExpiresAt: new Date(
            currentDate.getTime() + this.expireAfterMiliseconds,
          ),
        });
        await this.emailAuthService.sendRestorePasswordCode({
          name: user.username,
          email,
          restorePasswordCode: code,
          html: command.html,
        });
      });
    } catch {
      notification.setCode(RestorePasswordCodes.TransactionError);
    }

    return notification;
  }
}
