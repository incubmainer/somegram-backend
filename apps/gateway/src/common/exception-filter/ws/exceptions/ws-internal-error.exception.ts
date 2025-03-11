import { WsException } from '@nestjs/websockets';

export class WsInternalErrorException extends WsException {
  constructor(message?: string | object) {
    super(message);
    this.name = WsInternalErrorException.name;
    this.message = 'Internal error exception';
  }
}
