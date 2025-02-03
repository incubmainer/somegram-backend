import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { NOTIFICATION_NAME_SPACE } from '../../../common/constants/route.constants';
import { LoggerService } from '@app/logger';
import { UseFilters, UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '../../../common/guards/ws-jwt/ws-jwt-auth.guard';
import { WsExceptionFilter } from '../../../common/exception-filter/ws/ws.exception-filter';
import { AppNotificationResultType } from '@app/application-notification';

@UseFilters(WsExceptionFilter)
@WebSocketGateway({ namespace: NOTIFICATION_NAME_SPACE })
export class NotificationWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly clients: Map<Socket, string> = new Map();

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(NotificationWsGateway.name);
  }

  @WebSocketServer() io: Server;

  @UseGuards(WsJwtAuthGuard)
  handleConnection(client: Socket, ...args: any[]): void {
    this.logger.debug(
      `Client connected: ${client.id}`,
      this.handleConnection.name,
    );
    this.clients.set(client, client.id);
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(
      `Client disconnected: ${client.id}`,
      this.handleDisconnect.name,
    );
    this.clients.delete(client);
  }

  private forceDisconnect(client: Socket): void {
    this.logger.debug(
      `Client force disconnected: ${client.id}`,
      this.forceDisconnect.name,
    );
    client.disconnect();
  }

  @SubscribeMessage('test')
  @UseGuards(WsJwtAuthGuard)
  async test() {
    console.log('TEST');
  }
}
