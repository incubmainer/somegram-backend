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

import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailAuthService } from '../../infrastructure/email-auth.service';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../../settings/configuration/configuration';
import { LoggerService } from '@app/logger';
import { NotificationObject } from '../../../../common/domain/notification';

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

// @LogClass({
//   level: 'trace',
//   loggerClassField: 'logger',
//   active: () => process.env.NODE_ENV !== 'production',
// })
@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase {
  private readonly expireAfterMiliseconds: number;
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly emailAuthService: EmailAuthService,
    //private readonly configService: ConfigService,
    private readonly configService: ConfigService<ConfigurationType, true>,

    // @InjectCustomLoggerService() private readonly logger: CustomLoggerService,
    private readonly logger: LoggerService,
  ) {
    //const config = this.configService.get<AuthConfig>('auth');
    // this.expireAfterMiliseconds =
    //   config.emailConfirmationTokenExpireAfterMiliseconds;

    this.expireAfterMiliseconds = this.configService.get('envSettings', {
      infer: true,
    }).EMAIL_CONFIRMATION_TOKEN_EXPIRE_AFTER_MILISECONDS;
    this.logger.setContext(RegistrationEmailResendingUseCase.name);
  }

  public async execute(
    command: RegistrationEmailResendingCommand,
  ): Promise<NotificationObject<void>> {
    this.logger.debug('Registration email resending', this.execute.name);
    const notification = new NotificationObject(
      RegistrationEmailResendingCodes.Success,
    );
    const { token, html } = command;
    try {
      await this.txHost.withTransaction(async () => {
        const userByToken = await this.userRepository.findUserByToken(token);
        if (!userByToken) {
          notification.setCode(RegistrationEmailResendingCodes.UserNotFound);
          this.logger.debug('user not found', this.execute.name);
          return notification;
        }
        if (userByToken && userByToken.isConfirmed) {
          notification.setCode(
            RegistrationEmailResendingCodes.EmailAlreadyConfirmated,
          );
          this.logger.debug('email already confirmed', this.execute.name);
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
        this.logger.debug(
          'Email have been confirmed success ',
          this.execute.name,
        );
      });
    } catch (e) {
      this.logger.error(e, this.execute.name);
      notification.setCode(RegistrationEmailResendingCodes.TransactionError);
    }
    return notification;
  }
}
