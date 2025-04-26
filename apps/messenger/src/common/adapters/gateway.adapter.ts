import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { GATEWAY_CLIENT_RMQ } from '../constants/adapters-name.constant';
import {
  MESSAGE_READ,
  NEW_MESSAGE,
} from '../../../../gateway/src/common/constants/service.constants';
import { NewMessageGatewayDto } from '../domain/types';

@Injectable()
export class GatewayAdapter {
  constructor(
    @Inject(GATEWAY_CLIENT_RMQ)
    private readonly gatewayClient: ClientProxy,
  ) {}

  newMessageEvent(payload: NewMessageGatewayDto): void {
    this.gatewayClient.emit({ cmd: NEW_MESSAGE }, payload);
  }

  messageReadEvent(payload: NewMessageGatewayDto): void {
    this.gatewayClient.emit({ cmd: MESSAGE_READ }, payload);
  }
}
