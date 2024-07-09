import { ValueObject } from 'apps/gateway/src/common/domain/value-object';

interface UserUpdatedAtProps {
  value: Date;
}

export class UserUpdatedAt extends ValueObject<UserUpdatedAtProps> {
  constructor(value: Date) {
    if (!UserUpdatedAt.validateUpdatedAt(value))
      throw new Error('Invalid updatedAt');
    super({ value });
  }

  get value(): Date {
    return this.props.value;
  }

  private static validateUpdatedAt(createdAt: Date): boolean {
    if (createdAt > new Date()) return false;
    return true;
  }
}
