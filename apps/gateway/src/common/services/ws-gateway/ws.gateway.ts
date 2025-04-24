import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultEnum,
  AppNotificationResultType,
  WsNotification,
} from '@app/application-notification';
import { WsResponseDto } from '@app/base-types-enum';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { ConfigService } from '@nestjs/config';
import { EnvSettings } from '../../../settings/env/env.settings';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../../../features/users/infrastructure/users.repository';
import { JWTAccessTokenPayloadType } from '../../../features/auth/domain/types';

export abstract class WsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  protected _io: Server;

  protected readonly clients: Map<Socket, string> = new Map();
  protected readonly userSockets: Map<string, Set<Socket>> = new Map();
  protected readonly envSettings: EnvSettings;

  constructor(
    protected readonly logger: LoggerService,
    protected readonly appNotification: ApplicationNotification,
    protected readonly configService: ConfigService<ConfigurationType, true>,
    protected readonly jwtService: JwtService,
    protected readonly usersRepository: UsersRepository,
    protected readonly wsNotification: WsNotification,
  ) {
    this.envSettings = this.configService.get('envSettings');
  }

  protected async authConnection(client: Socket): Promise<string | null> {
    this.logger.debug('Execute: auth connection', this.authConnection.name);
    const token = client.handshake?.headers?.authorization as string;
    let userId: string | null = null;

    const unauthorizedPayload: WsResponseDto<null> =
      this.wsNotification.generate(
        'Unauthorized exception',
        AppNotificationResultEnum.Unauthorized,
        null,
      );

    if (!token?.trim()) {
      this.forceDisconnect(client, unauthorizedPayload);
      return null;
    }

    const splitToken: string[] = token.split(' ');

    if (splitToken[0].trim() !== 'Bearer') {
      this.forceDisconnect(client, unauthorizedPayload);
      return null;
    }

    try {
      const result: JWTAccessTokenPayloadType = this.jwtService.verify(
        splitToken[1],
        {
          secret: this.envSettings.JWT_SECRET,
        },
      );
      userId = result.userId;

      const user = await this.usersRepository.getUserById(userId);
      if (!user || user.userBanInfo) {
        this.forceDisconnect(client, unauthorizedPayload);
        return null;
      }
    } catch (e) {
      this.forceDisconnect(client, unauthorizedPayload);
      return null;
    }

    return userId;
  }

  protected clearClient(client: Socket): void {
    const userId = this.clients.get(client);
    if (!userId) return;

    this.clients.delete(client);

    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(client);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  protected forceDisconnect<T = null>(client: Socket, payload: T): void {
    this.logger.debug(
      `Client force disconnected: ${client.id}`,
      this.forceDisconnect.name,
    );
    this.clearClient(client);
    client.emit('error', payload);
    client.disconnect();
  }

  async handleConnection(client: Socket): Promise<void> {
    this.logger.debug(
      `Client connected: ${client.id}`,
      this.handleConnection.name,
    );

    const userId = await this.authConnection(client);
    if (!userId) return;

    this.clients.set(client, userId);

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }

    this.userSockets.get(userId)!.add(client);
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(
      `Client disconnected: ${client.id}`,
      this.handleDisconnect.name,
    );

    this.clearClient(client);
  }

  public emitMessageByUserId<T = null>(
    userId: string,
    event: string,
    payload: T,
  ): AppNotificationResultType<null> {
    this.logger.debug(
      `Execute: sending message to all connected clients of user ${userId}`,
      this.emitMessageByUserId.name,
    );

    const clients = this.userSockets.get(userId);

    if (!clients || clients.size === 0) {
      this.logger.debug(
        `No active clients found for user ${userId}`,
        this.emitMessageByUserId.name,
      );
      return this.appNotification.notFound();
    }

    clients.forEach((client) => client.emit(event, payload));

    return this.appNotification.success(null);
  }

  public joinRoom(client: Socket, room: string, id: string): void {
    client.join(`${room}_${id}`);
    this.logger.debug(
      `Client ${client.id} joined to room: ${room}_${id}`,
      this.joinRoom.name,
    );
  }

  public leaveRoom(client: Socket, room: string, id: string): void {
    client.leave(`${room}_${id}`);
    this.logger.debug(
      `Client ${client.id} left ${room}_${id}`,
      this.leaveRoom.name,
    );
  }

  public emitToRoom<T = null>(
    room: string,
    id: string,
    event: string,
    payload: T,
  ): void {
    this._io.to(`${room}_${id}`).emit(event, payload);
    this.logger.debug(
      `Emit event '${event}' to room: ${room}_${id}`,
      this.emitToRoom.name,
    );
  }
}
