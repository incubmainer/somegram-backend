import { WsException } from '@nestjs/websockets';

export class WsNotFoundException extends WsException {
  constructor(message?: string | object) {
    super(message);
    this.name = WsNotFoundException.name;
    this.message = 'Not found exception';
  }
}
