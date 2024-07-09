import { ValueObject } from 'apps/gateway/src/common/domain/value-object';

interface ResetPasswordCodeProps {
  value: string;
}

export class ResetPasswordCode extends ValueObject<ResetPasswordCodeProps> {
  constructor(value: string) {
    super({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
