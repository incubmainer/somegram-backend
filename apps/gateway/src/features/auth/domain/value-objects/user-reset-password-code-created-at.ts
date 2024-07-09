import { ValueObject } from 'apps/gateway/src/common/domain/value-object';

interface UserResetPasswordCodeCreatedAtProps {
  value: Date;
}

export class UserResetPasswordCodeCreatedAt extends ValueObject<UserResetPasswordCodeCreatedAtProps> {
  constructor(value: Date) {
    super({ value });
  }

  get value(): Date {
    return this.props.value;
  }
}
