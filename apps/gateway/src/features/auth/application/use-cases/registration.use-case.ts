import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler } from '@nestjs/cqrs';
import { Notification } from 'apps/gateway/src/common/domain/notification';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { UserRepository } from '../../infrastructure/user.repository';
import { CryptoAuthService } from '../../infrastructure/crypto-auth.service';
import { EmailAuthService } from '../../infrastructure/email-auth.service';
import { IsUsername } from '../decorators/is-username';
import { IsEmail, IsString, validateSync } from 'class-validator';
import { IsUserPassword } from '../decorators/is-user-password';

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
    this.email = email;
    this.password = password;
    this.html = html;
    const errors = validateSync(this);
    if (errors.length) throw new Error('Validation failed');
  }
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly cryptoAuthService: CryptoAuthService,
    private readonly emailAuthService: EmailAuthService,
  ) {}

  public async execute(
    command: RegistrationCommand,
  ): Promise<Notification<void>> {
    const notification = new Notification(RegistrationCodes.Success);
    const { username, email, password, html } = command;
    try {
      await this.txHost.withTransaction(async () => {
        const currentDate = new Date();
        const userByEmail = await this.userRepository.getUserByEmail(email);
        if (userByEmail && userByEmail.isConfirmed) {
          notification.setCode(RegistrationCodes.EmailAlreadyExists);
          throw new Error('Email already exists');
        }
        const userByUsername =
          await this.userRepository.getUserByUsername(username);
        if (userByUsername && userByUsername.isConfirmed) {
          notification.setCode(RegistrationCodes.UsernameAlreadyExists);
          throw new Error('Username already exists');
        }

        // delete not confirmed user if exists
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
        const confirmationToken =
          await this.cryptoAuthService.generateConfirmationToken();
        const hoursExpires = 24;
        const confirmationTokenExpiresAt = new Date(
          currentDate.getTime() + 1000 * 60 * 60 * hoursExpires,
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
          confirmationToken,
          html,
        });
      });
    } catch (e) {
      if (notification.getCode() === RegistrationCodes.Success) {
        notification.setCode(RegistrationCodes.TransactionError);
      }
    }
    return notification;
  }
}
