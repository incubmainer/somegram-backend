import { ValueObject } from 'apps/gateway/src/common/domain/value-object';

interface ConfirmationTokenProps {
  value: string;
}

export class ConfirmationToken extends ValueObject<ConfirmationTokenProps> {
  constructor(value: string) {
    super({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
