import { ValueObject } from 'apps/gateway/src/common/domain/value-object';

interface UserConfirmationTokenExpiredAtProps {
  value: Date;
}

export class UserConfirmationTokenExpiredAt extends ValueObject<UserConfirmationTokenExpiredAtProps> {
  constructor(value: Date) {
    super({ value });
  }

  get value(): Date {
    return this.props.value;
  }
}
