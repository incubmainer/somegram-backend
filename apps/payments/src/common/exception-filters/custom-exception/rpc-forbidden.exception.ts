import { RpcException } from '@nestjs/microservices';

export class RpcForbiddenException extends RpcException {
  constructor(message: string | object) {
    super(message);
    this.name = RpcForbiddenException.name;
    this.message = 'Forbidden Exception';
  }
}
