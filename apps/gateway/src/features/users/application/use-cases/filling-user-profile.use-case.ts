import { CommandHandler } from '@nestjs/cqrs';
import { Notification } from 'apps/gateway/src/common/domain/notification';
import { IsString, validateSync, ValidationError } from 'class-validator';
import { IsUsername } from '../../../auth/application/decorators/is-username';
import { IsFirstName } from '../decorators/is-first-name';
import { IsLastName } from '../decorators/is-last-name';
import { IsDateOfBirth } from '../decorators/is-date-of-birth';
import { IsAboutMe } from '../decorators/is-about-me';
import { UserRepository } from '../../../auth/infrastructure/user.repository';
import { parseDateDDMMYYYY } from 'apps/gateway/src/common/utils/parse-date-dd-mm-yyyy';

export const FillingUserProfileCodes = {
  Success: Symbol('success'),
  UserNotFound: Symbol('userNotFound'),
  ValidationCommandError: Symbol('validationCommandError'),
  TransactionError: Symbol('transactionError'),
};

export class FillingUserProfileCommand {
  @IsString()
  public readonly userId: string;
  @IsUsername()
  public readonly username: string;
  @IsFirstName()
  public readonly firstName: string;
  @IsLastName()
  public readonly lastName: string;
  @IsDateOfBirth()
  public readonly dateOfBirth: string;
  @IsAboutMe()
  public readonly aboutMe: string;
  constructor(
    userId: string,
    username: string,
    firstName: string,
    lastName: string,
    dateOfBirth: string,
    about: string,
  ) {
    this.userId = userId;
    this.username = username;
    this.firstName = firstName;
    this.lastName = lastName;
    this.dateOfBirth = dateOfBirth;
    this.aboutMe = about;
  }
}

@CommandHandler(FillingUserProfileCommand)
export class FillingUserProfileUseCase {
  constructor(private readonly userRepository: UserRepository) { }

  public async execute(
    command: FillingUserProfileCommand,
  ): Promise<Notification<null> | Notification<null, ValidationError>> {
    const errors = validateSync(command);
    if (errors.length) {
      const note = new Notification<null, ValidationError>(
        FillingUserProfileCodes.ValidationCommandError,
      );
      note.addErrors(errors);
      return note;
    }
    const { userId, username, firstName, lastName, dateOfBirth, aboutMe } =
      command;
    const notification = new Notification<null>(
      FillingUserProfileCodes.Success,
    );
    try {
      const currentDate = new Date();
      const dateOfBirthDate = parseDateDDMMYYYY(dateOfBirth);
      const isUpdated = await this.userRepository.updateUserProfileInfo(
        userId,
        {
          username,
          firstName,
          lastName,
          dateOfBirth: dateOfBirthDate,
          aboutMe,
          updatedAt: currentDate,
        },
      );
      if (!isUpdated) {
        notification.setCode(FillingUserProfileCodes.UserNotFound);
        return notification;
      }
    } catch (e) {
      if (notification.getCode() === FillingUserProfileCodes.Success) {
        notification.setCode(FillingUserProfileCodes.TransactionError);
      }
    }
    return notification;
  }
}
