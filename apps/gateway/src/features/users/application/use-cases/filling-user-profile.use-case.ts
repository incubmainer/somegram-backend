import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler } from '@nestjs/cqrs';
import { Notification } from 'apps/gateway/src/common/domain/notification';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { IsString, validateSync } from 'class-validator';
import { AvatarStorageService } from '../../infrastructure/avatar-storage.service';
import { AvatarRepository } from '../../infrastructure/avatar.repository';
import { IsUsername } from '../../../auth/application/decorators/is-username';
import { IsFirstName } from '../decorators/is-first-name';
import { IsLastName } from '../decorators/is-last-name';
import { IsDateOfBirth } from '../decorators/is-date-of-birth';
import { IsAboutMe } from '../decorators/is-about-me';

export const FillingUserProfileCodes = {
  Success: Symbol('success'),
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
  public readonly dateOfBirth: Date;
  @IsAboutMe()
  public readonly aboutMe: string;
  constructor(
    userId: string,
    username: string,
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
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
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
  ) { }

  public async execute(
    command: FillingUserProfileCommand,
  ): Promise<Notification<string>> {
    const errors = validateSync(command);
    if (errors.length) {
      return new Notification<string>(
        FillingUserProfileCodes.ValidationCommandError,
      );
    }
    const { userId, username, firstName, lastName, dateOfBirth, aboutMe } =
      command;
    const notification = new Notification<string>(
      FillingUserProfileCodes.Success,
    );
    try {
      await this.txHost.withTransaction(async () => {
        const currentDate = new Date();
      });
    } catch (e) {
      if (notification.getCode() === FillingUserProfileCodes.Success) {
        notification.setCode(FillingUserProfileCodes.TransactionError);
      }
    }
    return notification;
  }
}
