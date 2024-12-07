import { CommandHandler } from '@nestjs/cqrs';
import { User } from '@prisma/gateway';
import { IsString, validateSync, ValidationError } from 'class-validator';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';

import { NotificationObject } from 'apps/gateway/src/common/domain/notification';
import { IsUsername } from '../../../auth/application/decorators/is-username';
import { IsFirstName } from '../decorators/is-first-name';
import { IsLastName } from '../decorators/is-last-name';
import { IsDateOfBirth } from '../decorators/is-date-of-birth';

import { parseDateDDMMYYYY } from 'apps/gateway/src/common/utils/parse-date-dd-mm-yyyy';
import { IsCityName } from '../decorators/is-city';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UsersQueryRepository } from '../../infrastructure/users.query-repository';
import { IsAbout } from '../decorators/is-about';
import { IsCountry } from '../decorators/is-coutry';
import { LoggerService } from '@app/logger';

export const FillingUserProfileCodes = {
  Success: Symbol('success'),
  UserNotFound: Symbol('userNotFound'),
  UsernameAlreadyExists: Symbol('username_already_exists'),
  ValidationCommandError: Symbol('validationCommandError'),
  TransactionError: Symbol('transactionError'),
};

export class FillingUserProfileCommand {
  @IsString()
  public readonly userId: string;
  @IsUsername()
  public readonly userName: string;
  @IsFirstName()
  public readonly firstName: string;
  @IsLastName()
  public readonly lastName: string;
  @IsDateOfBirth()
  public readonly dateOfBirth: string;
  @IsAbout()
  public readonly about: string;
  @IsCityName()
  public readonly city: string;
  @IsCountry()
  public readonly country: string;
  constructor(
    userId: string,
    userName: string,
    firstName: string,
    lastName: string,
    dateOfBirth: string,
    about: string,
    city: string,
    country: string,
  ) {
    this.userId = userId;
    this.userName = userName;
    this.firstName = firstName;
    this.lastName = lastName;
    this.dateOfBirth = dateOfBirth;
    this.about = about;
    this.city = city;
    this.country = country;
  }
}

@CommandHandler(FillingUserProfileCommand)
// @LogClass({
//   level: 'trace',
//   loggerClassField: 'logger',
//   active: () => process.env.NODE_ENV !== 'production',
// })
export class FillingUserProfileUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    //@InjectCustomLoggerService() private readonly logger: CustomLoggerService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(FillingUserProfileUseCase.name);
  }

  public async execute(
    command: FillingUserProfileCommand,
  ): Promise<
    NotificationObject<null | User> | NotificationObject<null, ValidationError>
  > {
    const errors = validateSync(command);
    if (errors.length) {
      const note = new NotificationObject<null, ValidationError>(
        FillingUserProfileCodes.ValidationCommandError,
      );
      note.addErrors(errors);
      return note;
    }
    const {
      userId,
      userName,
      firstName,
      lastName,
      dateOfBirth,
      about,
      city,
      country,
    } = command;
    const notification = new NotificationObject<User | null>(
      FillingUserProfileCodes.Success,
    );
    try {
      const user = await this.usersQueryRepository.findUserById(command.userId);
      if (!user) {
        notification.setCode(FillingUserProfileCodes.UserNotFound);
        return notification;
      }

      const uniqueUsername =
        await this.usersQueryRepository.getUserByUsername(userName);

      if (uniqueUsername?.username) {
        if (user.id !== uniqueUsername.id) {
          notification.setCode(FillingUserProfileCodes.UsernameAlreadyExists);
          return notification;
        }
      }
      const updatedUser = await this.usersRepository.updateUserProfileInfo(
        userId,
        {
          userName,
          firstName,
          lastName,
          dateOfBirth: dateOfBirth ? parseDateDDMMYYYY(dateOfBirth) : null,
          about: about ? about : null,
          updatedAt: new Date(),
          city: city ? city : null,
          country: country ? country : null,
        },
      );
      notification.setData(updatedUser);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      notification.setCode(FillingUserProfileCodes.TransactionError);
    }
    return notification;
  }
}
