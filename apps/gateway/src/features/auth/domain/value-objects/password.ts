import { ValueObject } from 'apps/gateway/src/common/domain/value-object';

interface PasswordProps {
  value: string;
}

const HAS_DIGIT = /\d/;
const HAS_UPPER_CASE = /[A-Z]/;
const HAS_LOWER_CASE = /[a-z]/;
const HAS_SPECIAL_CHAR = /[!\"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~]/;
export class Password extends ValueObject<PasswordProps> {
  constructor(value: string) {
    if (!Password.validatePassword(value)) {
      throw new Error('Invalid password format');
    }
    super({ value });
  }

  get value(): string {
    return this.props.value;
  }

  private static validatePassword(password: string): boolean {
    const hasDigit = HAS_DIGIT.test(password);
    const hasUpperCase = HAS_UPPER_CASE.test(password);
    const hasLowerCase = HAS_LOWER_CASE.test(password);
    const hasSpecialChar = HAS_SPECIAL_CHAR.test(password);
    if (hasDigit && hasUpperCase && hasLowerCase && hasSpecialChar) {
      return true;
    }
    return false;
  }
}
