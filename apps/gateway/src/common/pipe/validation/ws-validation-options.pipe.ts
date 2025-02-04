import { ValidationPipeOptions } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { WsUnprocessableEntityException } from '../../exception-filter/ws/exceptions/ws-unprocessable-entity.exception';

export class WsValidationPipeOption implements ValidationPipeOptions {
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

      return new WsUnprocessableEntityException(errorsApi);
    };
  }
}
