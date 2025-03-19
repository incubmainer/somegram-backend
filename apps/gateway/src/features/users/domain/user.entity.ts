import { $Enums, User } from '@prisma/gateway';
import { AggregateRoot } from '@nestjs/cqrs';
import { RegisteredUserEvent } from '../../auth/application/events/registred-user.envent';
import { RegistrationUserSuccessEvent } from '../../auth/application/events/registration-user-success.envent';
import { RestorePasswordEvent } from '../../auth/application/events/restore-password.envent';
import { FillProfileInputDto } from '../api/dto/input-dto/fill-profile.input-dto';
import { AccountType } from '../../../../../../libs/common/enums/payments';
import { SendEmailNotificationSubscriptionActivatedEvent } from '../../notification/application/event/send-email-notification-subscription-activated.event';
import { SendEmailNotificationSubscriptionDisabledEvent } from '../../notification/application/event/send-email-notification-subscription-disabled.event';

export class UserEntity extends AggregateRoot implements User {
  id: string;
  username: string;
  email: string;
  hashPassword: string;
  createdAt: Date;
  updatedAt: Date;
  isConfirmed: boolean;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  about: string;
  city: string;
  country: string;
  accountType: $Enums.AccountType;
  subscriptionExpireAt: Date;
  isDeleted: boolean;

  constructor(dto: User) {
    super();
    this.id = dto.id;
    this.username = dto.username;
    this.email = dto.email;
    this.hashPassword = dto.hashPassword;
    this.createdAt = dto.createdAt;
    this.updatedAt = dto.updatedAt;
    this.isConfirmed = dto.isConfirmed;
    this.firstName = dto.firstName;
    this.lastName = dto.lastName;
    this.dateOfBirth = dto.dateOfBirth;
    this.about = dto.about;
    this.city = dto.city;
    this.country = dto.country;
    this.accountType = dto.accountType;
    this.subscriptionExpireAt = dto.subscriptionExpireAt;
    this.isDeleted = dto.isDeleted;
  }

  registrationUserEvent(code: string, expiredAt: Date, html: string): void {
    this.apply(
      new RegisteredUserEvent(
        this.email,
        this.firstName ?? this.username,
        expiredAt,
        code,
        html,
      ),
    );
  }

  passwordRecoveryEvent(code: string, html: string): void {
    this.apply(
      new RestorePasswordEvent(
        this.email,
        this.firstName ?? this.username,
        code,
        html,
      ),
    );
  }

  registrationSuccessEvent(): void {
    this.apply(new RegistrationUserSuccessEvent(this.email));
  }

  changeAccountTypeToBusinessEvent(): void {
    this.apply(
      new SendEmailNotificationSubscriptionActivatedEvent(
        this.email,
        this.subscriptionExpireAt,
      ),
    );
  }

  changeAccountTypeToPersonalEvent(): void {
    this.apply(new SendEmailNotificationSubscriptionDisabledEvent(this.email));
  }

  updatePassword(password: string): void {
    this.hashPassword = password;
  }

  fillProfileInfo(updateDto: FillProfileInputDto, birthday: Date | null): void {
    this.username = updateDto.userName;
    this.firstName = updateDto.firstName;
    this.lastName = updateDto.lastName;
    this.dateOfBirth = birthday;
    this.about = updateDto.about ?? null;
    this.updatedAt = new Date();
    this.city = updateDto.city ?? null;
    this.country = updateDto.country ?? null;
  }

  changeUserSubscription(
    expireAt: Date | null,
    accountType: AccountType,
  ): void {
    this.subscriptionExpireAt = expireAt;
    this.accountType = accountType;
  }
}
