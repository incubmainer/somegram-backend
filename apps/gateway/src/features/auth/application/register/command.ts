import { Email } from '../../domain/value-objects/email';
import { Password } from '../../domain/value-objects/password';
import { Username } from '../../domain/value-objects/username';

export class RegisterCommand {
  constructor(
    public readonly username: Username,
    public readonly email: Email,
    public readonly password: Password,
  ) { }
}
