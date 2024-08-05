import { ValidationError } from 'class-validator';

export class ValidationException extends Error {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super(
      `Validation failed: ${errors.map((err) => `${err.property}: ${Object.values(err.constraints).join(', ')}`).join('; ')}`,
    );
    this.errors = errors;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
