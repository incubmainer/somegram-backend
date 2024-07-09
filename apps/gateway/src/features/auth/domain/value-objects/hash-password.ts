import { ValueObject } from 'apps/gateway/src/common/domain/value-object';

interface HashPasswordProps {
  value: string;
}

export class HashPassword extends ValueObject<HashPasswordProps> {
  constructor(value: string) {
    super({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
