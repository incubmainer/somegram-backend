import { WsException } from '@nestjs/websockets';

export class WsUnprocessableEntityException extends WsException {
  constructor(message?: string | object) {
    super(message);
    this.name = WsUnprocessableEntityException.name;
    this.message = 'Validation failed exception';
  }
}
