import { ValueObject } from 'apps/gateway/src/common/domain/value-object';

interface UserIdProps {
  value: string;
}

export class UserId extends ValueObject<UserIdProps> {
  constructor(value: string) {
    super({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
