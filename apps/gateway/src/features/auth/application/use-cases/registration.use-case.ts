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

import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CryptoAuthService } from '../../infrastructure/crypto-auth.service';
import { EmailAuthService } from '../../infrastructure/email-auth.service';
import { IsUsername } from '../decorators/is-username';
import { IsUserPassword } from '../decorators/is-user-password';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../../settings/configuration/configuration';
import { LoggerService } from '@app/logger';
import { NotificationObject } from '../../../../common/domain/notification';

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

// @LogClass({
//   level: 'trace',
//   loggerClassField: 'logger',
//   active: () => process.env.NODE_ENV !== 'production',
// })
@CommandHandler(RegistrationCommand)
export class RegistrationUseCase {
  private readonly expireAfterMiliseconds: number;
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly cryptoAuthService: CryptoAuthService,
    //private readonly configService: ConfigService,
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly emailAuthService: EmailAuthService,
    //@InjectCustomLoggerService() private readonly logger: CustomLoggerService,
    private readonly logger: LoggerService,
  ) {
    // const config = this.configService.get<AuthConfig>('auth');
    // this.expireAfterMiliseconds =
    //   config.emailConfirmationTokenExpireAfterMiliseconds;

    this.expireAfterMiliseconds = this.configService.get('envSettings', {
      infer: true,
    }).EMAIL_CONFIRMATION_TOKEN_EXPIRE_AFTER_MILISECONDS;
    this.logger.setContext(RegistrationUseCase.name);
  }

  public async execute(
    command: RegistrationCommand,
  ): Promise<NotificationObject<void>> {
    this.logger.debug('registration command', this.execute.name);
    const notification = new NotificationObject(RegistrationCodes.Success);
    const { username, email, password, html } = command;
    try {
      await this.txHost.withTransaction(async () => {
        const currentDate = new Date();
        const userByEmail = await this.userRepository.getUserByEmail(email);
        if (userByEmail && userByEmail.isConfirmed) {
          notification.setCode(RegistrationCodes.EmailAlreadyExists);
          this.logger.debug('email already exists', this.execute.name);
          return notification;
        }
        const userByUsername =
          await this.userRepository.getUserByUsername(username);
        if (userByUsername && userByUsername.isConfirmed) {
          this.logger.debug('username already exists', this.execute.name);
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
        this.logger.debug('registration success', this.execute.name);
      });
    } catch (e) {
      this.logger.error(e, this.execute.name);
      notification.setCode(RegistrationCodes.TransactionError);
    }
    return notification;
  }
}
