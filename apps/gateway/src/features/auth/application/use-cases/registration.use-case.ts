import { TransactionHost } from '@nestjs-cls/transactional';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CryptoAuthService } from '../../infrastructure/crypto-auth.service';
import { EmailAuthService } from '../../infrastructure/email-auth.service';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../../settings/configuration/configuration';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { User } from '@prisma/gateway';
import { RegistrationBodyInputDto } from '../../api/dto/input-dto/registration.body.input-dto';

export class RegistrationCommand {
  constructor(public registrationInputDto: RegistrationBodyInputDto) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase
  implements
    ICommandHandler<
      RegistrationCommand,
      AppNotificationResultType<null, string>
    >
{
  private readonly expireAfterMilliseconds: number;
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly cryptoAuthService: CryptoAuthService,
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly emailAuthService: EmailAuthService,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(RegistrationUseCase.name);
    this.expireAfterMilliseconds = this.configService.get('envSettings', {
      infer: true,
    }).EMAIL_CONFIRMATION_TOKEN_EXPIRE_AFTER_MILISECONDS;
  }

  public async execute(
    command: RegistrationCommand,
  ): Promise<AppNotificationResultType<null, string>> {
    this.logger.debug('Execute: registration command', this.execute.name);
    const {
      username,
      email: emailRaw,
      password,
      html,
    } = command.registrationInputDto;
    const email: string = emailRaw.toLowerCase();
    try {
      return await this.txHost.withTransaction(async () => {
        const currentDate: Date = new Date();
        const getUserByEmail: User =
          await this.userRepository.getUserByEmail(email);
        if (getUserByEmail && getUserByEmail.isConfirmed)
          return this.appNotification.badRequest('Email already exist');

        const userByUsername: User =
          await this.userRepository.getUserByUsername(username);

        if (userByUsername && userByUsername.isConfirmed)
          return this.appNotification.badRequest('User name already exist');

        if (
          getUserByEmail &&
          userByUsername &&
          getUserByEmail.id === userByUsername.id
        ) {
          await this.userRepository.deleteUserById(getUserByEmail.id);
        } else {
          if (getUserByEmail) {
            await this.userRepository.deleteUserById(getUserByEmail.id);
          }
          if (userByUsername) {
            await this.userRepository.deleteUserById(userByUsername.id);
          }
        }

        const hashPassword: string =
          await this.cryptoAuthService.hashPassword(password);
        const confirmationToken: string = randomUUID().replaceAll('-', '');
        const confirmationTokenExpiresAt: Date = new Date(
          currentDate.getTime() + this.expireAfterMilliseconds,
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

        return this.appNotification.success(null);
      });
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
