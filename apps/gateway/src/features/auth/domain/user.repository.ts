import { User } from './user';
import { Email } from './value-objects/email';
import { UserId } from './value-objects/user-id';
import { Username } from './value-objects/username';

export abstract class UserRepository {
  abstract isUniqueEmail(email: Email): Promise<boolean>;
  abstract isUniqueUsername(username: Username): Promise<boolean>;
  abstract generateId(): UserId;
  abstract save(user: User): Promise<void>;
}
