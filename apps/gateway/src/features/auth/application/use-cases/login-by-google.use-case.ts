import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler } from '@nestjs/cqrs';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { IsBoolean, IsEmail, IsString, validateSync } from 'class-validator';
import { EmailAuthService } from '../../infrastructure/email-auth.service';
import { NotificationObject } from '../../../../common/domain/notification';

export const LoginByGoogleCodes = {
  Success: Symbol('success'),
  GoogleEmailNotVerified: Symbol('google_email_not_verified'),
  GoogleAccountAlreadyUsed: Symbol('google_account_already_used'),
  MergeAccountWithGoogle: Symbol('merge_account_with_google'),
  WrongEmail: Symbol('wrong_email'),
  TransactionError: Symbol('transaction_error'),
};

export class LoginByGoogleCommand {
  @IsString()
  googleId: string;
  @IsString()
  googleName: string;
  @IsEmail()
  googleEmail: string;
  @IsBoolean()
  googleEmailVerified: boolean;
  constructor(
    googleId: string,
    googleName: string,
    googleEmail: string,
    googleEmailVerified: boolean,
  ) {
    this.googleId = googleId;
    this.googleName = googleName;
    this.googleEmail = googleEmail;
    this.googleEmailVerified = googleEmailVerified;
    const errors = validateSync(this);
    if (errors.length) throw new Error('Validation failed');
  }
}

type UserId = string;

@CommandHandler(LoginByGoogleCommand)
export class LoginByGoogleUseCase {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly emailAuthService: EmailAuthService,
  ) {}

  public async execute(
    command: LoginByGoogleCommand,
  ): Promise<NotificationObject<UserId>> {
    const { googleId, googleEmail, googleEmailVerified, googleName } = command;
    const notification = new NotificationObject<UserId>(
      LoginByGoogleCodes.Success,
    );
    if (!googleEmailVerified) {
      notification.setCode(LoginByGoogleCodes.GoogleEmailNotVerified);
      return notification;
    }
    try {
      await this.txHost.withTransaction(async () => {
        const currentDate = new Date();

        const userByGoogleId =
          await this.userRepository.getUserByGoogleSub(googleId);
        if (userByGoogleId) {
          notification.setData(userByGoogleId.id);
          notification.setCode(LoginByGoogleCodes.GoogleAccountAlreadyUsed);
          return notification;
        }
        const userByEmail =
          await this.userRepository.getUserByEmailWithGoogleInfo(googleEmail);
        if (userByEmail && userByEmail.googleInfo) {
          notification.setCode(LoginByGoogleCodes.WrongEmail);
          return notification;
        }
        if (userByEmail) {
          await this.userRepository.addGoogleInfoToUserAndConfirm(
            userByEmail.id,
            {
              sub: googleId,
              name: googleName,
              email: googleEmail,
              email_verified: googleEmailVerified,
            },
          );
          notification.setData(userByEmail.id);
          notification.setCode(LoginByGoogleCodes.MergeAccountWithGoogle);
          return;
        }

        const uniqueUsername =
          await this.userRepository.generateUniqueUsername();
        const userId =
          await this.userRepository.createConfirmedUserWithGoogleInfo({
            username: uniqueUsername,
            email: googleEmail,
            createdAt: currentDate,
            googleInfo: {
              sub: googleId,
              name: googleName,
              email: googleEmail,
              email_verified: googleEmailVerified,
            },
          });
        await this.emailAuthService.successRegistration(googleEmail);
        notification.setData(userId);
      });
    } catch {
      notification.setCode(LoginByGoogleCodes.TransactionError);
    }
    return notification;
  }
}
