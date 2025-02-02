import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UsersQueryRepository } from '../users/infrastructure/users.query-repository';
import { corsWhiteList } from '../../settings/configuration/configuration';
import { jwtConstants } from '../../common/constants/jwt-basic-constants';

@WebSocketGateway({
  cors: {
    origin: corsWhiteList,
  },
})
@Injectable()
export class SocketGatewayService
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly usersQueryRepo: UsersQueryRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  private readonly logger = new Logger(SocketGatewayService.name);
  private clients: Map<Socket, string> = new Map();

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.accesstoken as string;

      if (!token) {
        this.logger.warn(
          `Client ${client.id} tried to connect without a token.`,
        );

        this.forceDisconnect(client, 'Missing token2');
        return;
      }

      const decodedToken = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.JWT_SECRET,
      });
      const user = await this.usersQueryRepo.findUserById(decodedToken.userId);

      if (!user) {
        this.logger.warn(`Client ${client.id} unauthorized. User not found.`);
        this.forceDisconnect(client, 'Unauthorized');
        return;
      }

      client.data.user = user.id;

      this.clients.set(client, user.id);

      client.join(user.id);
      this.logger.log(`Client ${client.id} connected as user ${user.id}`);
    } catch (e) {
      this.forceDisconnect(client, 'Unauthorized');
      return;
    }
  }

  handleDisconnect(client: Socket): void {
    for (const [savedClient, userId] of this.clients) {
      if (savedClient === client) {
        this.clients.delete(savedClient);
        this.logger.log(
          `Client ${client.id} disconnected from user ${userId}.`,
        );
      }
    }
  }
  forceDisconnect(client: Socket, message: string) {
    this.logger.warn(`Forcing disconnect for client ${client.id}: ${message}`);
    client.emit('error', new WsException(message));
    client.disconnect(true);
  }
}
