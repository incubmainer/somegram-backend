import { ValueObject } from 'apps/gateway/src/common/domain/value-object';

interface UserCreatedAtProps {
  value: Date;
}

export class UserCreatedAt extends ValueObject<UserCreatedAtProps> {
  constructor(value: Date) {
    super({ value });
  }

  get value(): Date {
    return this.props.value;
  }
}
