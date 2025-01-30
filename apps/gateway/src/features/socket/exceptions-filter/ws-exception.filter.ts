import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(WsException)
export class WsExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  catch(exception: WsException, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client: Socket = ctx.getClient();

    const errorResponse = {
      type: exception.name,
      timestamp: new Date().toISOString(),
      message: exception.getError(),
    };

    client.emit('error', errorResponse);
    this.logger.error('WebSocket Exception:', JSON.stringify(errorResponse));
  }
}
