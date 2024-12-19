import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { IsEmail, IsString, validateSync } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailAuthService } from '../../infrastructure/email-auth.service';
import { ConfigurationType } from '../../../../settings/configuration/configuration';
import { RecapchaService } from '../../../../common/utils/recapcha.service';
import { NotificationObject } from '../../../../common/domain/notification';

export const RestorePasswordCodes = {
  Success: Symbol('success'),
  UserNotFound: Symbol('user_not_found'),
  InvalidRecaptcha: Symbol('Invalid_recaptcha'),
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
    this.email = email.toLowerCase();
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
    private readonly emailAuthService: EmailAuthService,
    //private readonly configService: ConfigService,
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly recapchaService: RecapchaService,
  ) {
    // const config = this.configService.get<AuthConfig>('auth');
    // this.expireAfterMiliseconds =
    //   config.restorePasswordCodeExpireAfterMiliseconds;
    this.expireAfterMiliseconds = this.configService.get('envSettings', {
      infer: true,
    }).RESTORE_PASSWORD_CODE_EXPIRE_AFTER_MILISECONDS;
  }

  public async execute(
    command: RestorePasswordCommand,
  ): Promise<NotificationObject<void>> {
    const notification = new NotificationObject(RestorePasswordCodes.Success);
    const { email, recaptchaToken } = command;
    const isValidRecaptcha =
      await this.recapchaService.verifyRecaptchaToken(recaptchaToken);
    if (!isValidRecaptcha) {
      notification.setCode(RestorePasswordCodes.InvalidRecaptcha);
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
