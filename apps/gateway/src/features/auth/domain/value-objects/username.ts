import { ValueObject } from 'apps/gateway/src/common/domain/value-object';

interface UsernameProps {
  value: string;
}

// contain only letters, numbers, underscores and hyphens
const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

export class Username extends ValueObject<UsernameProps> {
  constructor(value: string) {
    if (!Username.validateUsername(value)) {
      throw new Error('Invalid username format');
    }
    super({ value });
  }

  get value(): string {
    return this.props.value;
  }

  private static validateUsername(username: string): boolean {
    return (
      username.length >= 6 &&
      username.length <= 30 &&
      USERNAME_REGEX.test(username)
    );
  }
}
