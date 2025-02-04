import { WsException } from '@nestjs/websockets';

export class WsUnauthorizedException extends WsException {
  constructor(message?: string | object) {
    super(message);
    this.name = WsUnauthorizedException.name;
    this.message = 'Unauthorized exception';
  }
}
