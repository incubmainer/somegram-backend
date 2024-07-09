import { AggregateRoot } from '@nestjs/cqrs';
import { UserId } from './value-objects/user-id';
import { Username } from './value-objects/username';
import { Email } from './value-objects/email';
import { ConfirmationToken } from './value-objects/confirmation-token';
import { UserRegisteredEvent } from './events/user-registered.events';
import { ResetPasswordCode } from './value-objects/reset-password-code';
import { HashPassword } from './value-objects/hash-password';
import { UserCreatedAt } from './value-objects/user-created-at';
import { UserUpdatedAt } from './value-objects/user-updated-at';
import { UserConfirmationTokenExpiredAt } from './value-objects/user-confirmation-token-expired-at';
import { UserResetPasswordCodeExpiredAt } from './value-objects/user-reset-password-code-expired-at';
import { UserConfirmationTokenCreatedAt } from './value-objects/user-confirmation-token-created-at';
import { UserResetPasswordCodeCreatedAt } from './value-objects/user-reset-password-code-created-at';

export interface UserProps {
  id: UserId;
  username: Username;
  email: Email;
  hashPassword: HashPassword;
  createdAt: UserCreatedAt;
  updatedAt: UserUpdatedAt | null;
  isConfirmed: boolean;
  confirmationToken: ConfirmationToken | null;
  confirmationTokenExpiredAt: UserConfirmationTokenExpiredAt | null;
  confirmationTokenCreatedAt: UserConfirmationTokenCreatedAt | null;
  resetPasswordCode: ResetPasswordCode | null;
  resetPasswordCodeExpiredAt: UserResetPasswordCodeExpiredAt | null;
  resetPasswordCodeCreatedAt: UserResetPasswordCodeCreatedAt | null;
}

export class User extends AggregateRoot {
  private readonly props: UserProps;

  private constructor(props: UserProps) {
    super();
    this.props = props;
  }

  public static create(props: UserProps): User {
    const user = new User(props);
    return user;
  }

  public static registrate(
    id: UserId,
    username: Username,
    email: Email,
    hashPassword: HashPassword,
    confirmationToken: ConfirmationToken,
  ): User {
    const currentDate = new Date();
    const createdAt = new UserCreatedAt(currentDate);
    const confirmationTokenExpiredAtDate = new Date(
      currentDate.getTime() + 1000 * 60 * 60 * 24,
    );
    const confirmationTokenExpiredAt = new UserConfirmationTokenExpiredAt(
      confirmationTokenExpiredAtDate,
    );
    const confirmationTokenCreatedAt = new UserConfirmationTokenCreatedAt(
      currentDate,
    );
    const user = new User({
      id,
      username,
      email,
      hashPassword,
      createdAt,
      updatedAt: null,
      isConfirmed: false,
      confirmationToken,
      confirmationTokenExpiredAt,
      confirmationTokenCreatedAt,
      resetPasswordCode: null,
      resetPasswordCodeExpiredAt: null,
      resetPasswordCodeCreatedAt: null,
    });
    user.apply(
      new UserRegisteredEvent(
        user.props.id,
        user.props.email,
        user.props.username,
        user.props.createdAt,
        user.props.confirmationToken,
      ),
    );
    return user;
  }

  get id(): UserId {
    return this.props.id;
  }
}
