import { WsException } from '@nestjs/websockets';

export class WsForbiddenException extends WsException {
  constructor(message?: string | object) {
    super(message);
    this.name = WsForbiddenException.name;
    this.message = 'Forbidden exception';
  }
}
