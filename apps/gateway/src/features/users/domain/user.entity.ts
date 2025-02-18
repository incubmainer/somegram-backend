import { $Enums, User } from '@prisma/gateway';
import { AggregateRoot } from '@nestjs/cqrs';
import { RegisteredUserEvent } from '../../auth/application/events/registred-user.envent';

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
  }

  registrationUserEvent(code: string, html: string): void {
    this.apply(new RegisteredUserEvent());
  }

  registrationSuccessEvent(): void {
    this.apply(new RegisteredUserEvent());
  }

  addGoogleAccountToUser() {}
  mergeUserWithGoogleAccount(googleUser: UserEntity) {}
}
