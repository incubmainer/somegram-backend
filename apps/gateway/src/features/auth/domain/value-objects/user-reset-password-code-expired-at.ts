import { ValueObject } from 'apps/gateway/src/common/domain/value-object';

interface UserResetPasswordCodeExpiredAtProps {
  value: Date;
}

export class UserResetPasswordCodeExpiredAt extends ValueObject<UserResetPasswordCodeExpiredAtProps> {
  constructor(value: Date) {
    super({ value });
  }

  get value(): Date {
    return this.props.value;
  }
}
