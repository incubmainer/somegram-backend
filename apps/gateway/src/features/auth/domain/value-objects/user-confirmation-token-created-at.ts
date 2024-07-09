import { ValueObject } from 'apps/gateway/src/common/domain/value-object';

interface UserConfirmationTokenCreatedAtProps {
  value: Date;
}

export class UserConfirmationTokenCreatedAt extends ValueObject<UserConfirmationTokenCreatedAtProps> {
  constructor(value: Date) {
    super({ value });
  }

  get value(): Date {
    return this.props.value;
  }
}
