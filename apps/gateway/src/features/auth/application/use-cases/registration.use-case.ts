import { Transactional } from '@nestjs-cls/transactional';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../../settings/configuration/configuration';
import { LoggerService } from '@app/logger';
import { RegistrationBodyInputDto } from '../../api/dto/input-dto/registration.body.input-dto';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { AuthService } from '../auth.service';
import { UserCreatedDto } from '../../../users/domain/types';
import { UserEntity } from '../../../users/domain/user.entity';

export class RegistrationCommand {
  constructor(public registrationDto: RegistrationBodyInputDto) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase
  implements
    ICommandHandler<
      RegistrationCommand,
      AppNotificationResultType<null, string>
    >
{
  private readonly expireAfterMiliseconds: number;
  constructor(
    private readonly userRepository: UsersRepository,
    //private readonly authService: AuthService,
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly publisher: EventPublisher,
  ) {
    this.logger.setContext(RegistrationUseCase.name);
    this.expireAfterMiliseconds = this.configService.get('envSettings', {
      infer: true,
    }).EMAIL_CONFIRMATION_TOKEN_EXPIRE_AFTER_MILISECONDS;
  }

  public async execute(
    command: RegistrationCommand,
  ): Promise<AppNotificationResultType<null, string>> {
    this.logger.debug('Execute; registration user', this.execute.name);

    const { username, email, password, html } = command.registrationDto;

    try {
      const [userByEmail, userByUserName] = await Promise.all([
        this.userRepository.getUserByEmail(email),
        this.userRepository.getUserByUsername(username),
      ]);

      if (
        (userByEmail && userByEmail.isConfirmed) ||
        (userByUserName && userByUserName.isConfirmed)
      )
        return this.appNotification.badRequest('The user already exists');

      const userIdToDell = this.handleUser(userByEmail, userByUserName);
      const currentDate = new Date();

      const hashPassword = 'hashpassword';
      //const hashPassword = await this.authService.generateHash(password);

      const confirmationToken = randomUUID().replaceAll('-', '');
      const confirmationTokenExpiredAt = new Date(
        currentDate.getTime() + this.expireAfterMiliseconds,
      );

      const userCreatedDto: UserCreatedDto = {
        username: username,
        email: email,
        hashPassword: hashPassword,
        createdAt: currentDate,
        confirmationToken: confirmationToken,
        confirmationTokenExpiresAt: confirmationTokenExpiredAt,
        isConfirmed: false,
      };

      const newUser = await this.executeTransaction(
        userCreatedDto,
        userIdToDell,
      );

      this.publishEvent(
        newUser,
        confirmationToken,
        confirmationTokenExpiredAt,
        html,
      );
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  @Transactional()
  private async executeTransaction(
    userCreatedDto: UserCreatedDto,
    userIdToDell: string,
  ): Promise<UserEntity> {
    if (userIdToDell) await this.userRepository.removeUserById(userIdToDell);

    return await this.userRepository.createNotConfirmedUser(userCreatedDto);
  }

  private publishEvent(
    newUser: UserEntity,
    code: string,
    expiredAt: Date,
    html: string,
  ): void {
    const customerWithEvents = this.publisher.mergeObjectContext(newUser);

    customerWithEvents.registrationUserEvent(code, expiredAt, html);
    customerWithEvents.commit();
  }

  private handleUser(
    userByEmail: UserEntity,
    userByUserName: UserEntity,
  ): string {
    let userIdToDell: string | null = null;
    if (userByEmail && userByUserName && userByEmail.id === userByUserName.id) {
      userIdToDell = userByEmail.id;
    } else {
      if (userByEmail) {
        userIdToDell = userByEmail.id;
      }
      if (userByUserName) {
        userIdToDell = userByUserName.id;
      }
    }

    return userIdToDell;
  }
}
