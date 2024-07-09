import { ConfirmationToken } from '../value-objects/confirmation-token';
import { Email } from '../value-objects/email';
import { UserCreatedAt } from '../value-objects/user-created-at';
import { UserId } from '../value-objects/user-id';
import { Username } from '../value-objects/username';

export class UserRegisteredEvent {
  constructor(
    public readonly userId: UserId,
    public readonly username: Username,
    public readonly email: Email,
    public readonly createdAt: UserCreatedAt,
    public readonly confirmationToken: ConfirmationToken,
  ) { }
}
