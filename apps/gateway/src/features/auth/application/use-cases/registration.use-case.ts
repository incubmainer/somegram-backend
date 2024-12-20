import { TransactionHost } from '@nestjs-cls/transactional';
import { CommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { IsEmail, IsString, validateSync } from 'class-validator';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';

import { NotificationObject } from 'apps/gateway/src/common/domain/notification';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CryptoAuthService } from '../../infrastructure/crypto-auth.service';
import { EmailAuthService } from '../../infrastructure/email-auth.service';
import { IsUsername } from '../decorators/is-username';
import { IsUserPassword } from '../decorators/is-user-password';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from 'apps/gateway/src/common/config/configs/auth.config';

export const RegistrationCodes = {
  Success: Symbol('success'),
  EmailAlreadyExists: Symbol('email_already_exists'),
  UsernameAlreadyExists: Symbol('username_already_exists'),
  TransactionError: Symbol('transaction_error'),
};

export class RegistrationCommand {
  @IsUsername()
  public readonly username: string;
  @IsEmail()
  public readonly email: string;
  @IsUserPassword()
  public readonly password: string;
  @IsString()
  html: string;
  constructor(username: string, email: string, password: string, html: string) {
    this.username = username;
    this.email = email.toLowerCase();
    this.password = password;
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
@CommandHandler(RegistrationCommand)
export class RegistrationUseCase {
  private readonly expireAfterMiliseconds: number;
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly cryptoAuthService: CryptoAuthService,
    private readonly configService: ConfigService,
    private readonly emailAuthService: EmailAuthService,
    @InjectCustomLoggerService() private readonly logger: CustomLoggerService,
  ) {
    const config = this.configService.get<AuthConfig>('auth');
    this.expireAfterMiliseconds =
      config.emailConfirmationTokenExpireAfterMiliseconds;
    logger.setContext(RegistrationUseCase.name);
  }

  public async execute(
    command: RegistrationCommand,
  ): Promise<NotificationObject<void>> {
    this.logger.log('info', 'registration command', {});
    const notification = new NotificationObject(RegistrationCodes.Success);
    const { username, email, password, html } = command;
    try {
      await this.txHost.withTransaction(async () => {
        const currentDate = new Date();
        const userByEmail = await this.userRepository.getUserByEmail(email);
        if (userByEmail && userByEmail.isConfirmed) {
          notification.setCode(RegistrationCodes.EmailAlreadyExists);
          this.logger.log('warn', 'email already exists', {
            payload: { email },
          });
          return notification;
        }
        const userByUsername =
          await this.userRepository.getUserByUsername(username);
        if (userByUsername && userByUsername.isConfirmed) {
          this.logger.log('warn', 'username already exists', {
            payload: { username },
          });
          notification.setCode(RegistrationCodes.UsernameAlreadyExists);
          return notification;
        }
        if (
          userByEmail &&
          userByUsername &&
          userByEmail.id === userByUsername.id
        ) {
          await this.userRepository.deleteUserById(userByEmail.id);
        } else {
          if (userByEmail) {
            await this.userRepository.deleteUserById(userByEmail.id);
          }
          if (userByUsername) {
            await this.userRepository.deleteUserById(userByUsername.id);
          }
        }

        const hashPassword =
          await this.cryptoAuthService.hashPassword(password);
        const confirmationToken = randomUUID().replaceAll('-', '');
        const confirmationTokenExpiresAt = new Date(
          currentDate.getTime() + this.expireAfterMiliseconds,
        );
        await this.userRepository.createNotConfirmedUser({
          username,
          email,
          hashPassword,
          createdAt: currentDate,
          confirmationToken,
          confirmationTokenExpiresAt,
        });
        await this.emailAuthService.sendConfirmationEmail({
          name: username,
          email,
          expiredAt: confirmationTokenExpiresAt,
          confirmationToken,
          html,
        });
        this.logger.log('info', 'registration success', {});
      });
    } catch (e) {
      this.logger.log('error', 'transaction error', { e });
      notification.setCode(RegistrationCodes.TransactionError);
    }
    return notification;
  }
}
