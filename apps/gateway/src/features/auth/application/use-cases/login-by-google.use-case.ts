import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler } from '@nestjs/cqrs';
import { Notification } from 'apps/gateway/src/common/domain/notification';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { UserRepository } from '../../infrastructure/user.repository';
import { IsString, validateSync } from 'class-validator';
import { GoogleAuthService } from '../../infrastructure/google-auth.service';

export const LoginByGoogleCodes = {
  Success: Symbol('success'),
  UnvalidCode: Symbol('unvalid_code'),
  GoogleAccountAlreadyUsed: Symbol('google_account_already_used'),
  MergeAccountWithGoogle: Symbol('merge_account_with_google'),
  NotVerifiedEmailGoogle: Symbol('not_verified_email_google'),
  WrongEmail: Symbol('wrong_email'),
  TransactionError: Symbol('transaction_error'),
};

export class LoginByGoogleCommand {
  @IsString()
  code: string;
  constructor(code: string) {
    this.code = code;
    const errors = validateSync(this);
    if (errors.length) throw new Error('Validation failed');
  }
}

type UserId = string;

@CommandHandler(LoginByGoogleCommand)
export class LoginByGoogleUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  public async execute(
    command: LoginByGoogleCommand,
  ): Promise<Notification<UserId>> {
    const notification = new Notification<UserId>(LoginByGoogleCodes.Success);
    const { code } = command;
    try {
      await this.txHost.withTransaction(async () => {
        const currentDate = new Date();
        const googleUser = await this.googleAuthService.getUserInfoByCode(code);
        if (!googleUser) {
          notification.setCode(LoginByGoogleCodes.UnvalidCode);
          throw new Error('Unvalid code');
        }
        if (!googleUser.email_verified) {
          notification.setCode(LoginByGoogleCodes.NotVerifiedEmailGoogle);
          throw new Error('Not verified email');
        }

        const userByGoogleId = await this.userRepository.getUserByGoogleSub(
          googleUser.sub,
        );
        if (userByGoogleId) {
          notification.setData(userByGoogleId.id);
          notification.setCode(LoginByGoogleCodes.GoogleAccountAlreadyUsed);
          return;
        }
        const userByEmail =
          await this.userRepository.getUserByEmailWithGoogleInfo(
            googleUser.email,
          );
        if (userByEmail && userByEmail.googleInfo) {
          notification.setCode(LoginByGoogleCodes.WrongEmail);
          throw new Error('Wrong email');
        }
        if (userByEmail) {
          await this.userRepository.addGoogleInfoToUserAndConfirm(
            userByEmail.id,
            {
              sub: googleUser.sub,
              name: googleUser.name,
              given_name: googleUser.given_name,
              family_name: googleUser.family_name,
              picture: googleUser.picture,
              email: googleUser.email,
              email_verified: googleUser.email_verified,
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
            email: googleUser.email,
            createdAt: currentDate,
            googleInfo: {
              sub: googleUser.sub,
              name: googleUser.name,
              given_name: googleUser.given_name,
              family_name: googleUser.family_name,
              picture: googleUser.picture,
              email: googleUser.email,
              email_verified: googleUser.email_verified,
            },
          });
        notification.setData(userId);
      });
    } catch (e) {
      if (notification.getCode() === LoginByGoogleCodes.Success) {
        notification.setCode(LoginByGoogleCodes.TransactionError);
      }
    }
    return notification;
  }
}
