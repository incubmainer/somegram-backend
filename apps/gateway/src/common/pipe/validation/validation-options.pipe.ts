import {
  UnprocessableEntityException,
  ValidationPipeOptions,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class ValidationPipeOption implements ValidationPipeOptions {
  transform: true;
  stopAtFirstError: false;
  validateCustomDecorators: true;
  exceptionFactory: (errors: ValidationError[]) => any;

  constructor() {
    this.exceptionFactory = (errors: ValidationError[]) => {
      const errorsApi = [];
      errors.forEach((e) => {
        errorsApi.push({
          property: e.property,
          constraints: e.constraints,
        });
      });

      return new UnprocessableEntityException(errorsApi);
    };
  }
}
