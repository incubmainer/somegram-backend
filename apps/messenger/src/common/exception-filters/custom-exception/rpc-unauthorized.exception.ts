import { RpcException } from '@nestjs/microservices';

export class RpcUnauthorizedException extends RpcException {
  constructor(message: string | object) {
    super(message);
    this.name = RpcUnauthorizedException.name;
    this.message = 'Unauthorized Exception';
  }
}
