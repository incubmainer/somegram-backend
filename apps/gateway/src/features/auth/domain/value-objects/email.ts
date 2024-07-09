import { ValueObject } from 'apps/gateway/src/common/domain/value-object';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  constructor(value: string) {
    if (!Email.validateEmail(value)) throw new Error('Invalid email address');
    super({ value });
  }

  get value(): string {
    return this.props.value;
  }

  private static validateEmail(email: string): boolean {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }
}
