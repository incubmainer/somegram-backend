import { Injectable, ValidationPipe } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsValidationPipe extends ValidationPipe {
  createExceptionFactory(): () => unknown {
    return (validationError = []) => {
      if (this.isDetailedOutputDisabled) {
        return new WsException('Bad request');
      }

      const errors = this.flattenValidationErrors(validationError);

      return new WsException(errors);
    };
  }
}
