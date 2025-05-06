import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NOTIFICATION_NAME_SPACE } from '../../../common/constants/route.constants';
import { LoggerService } from '@app/logger';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WsExceptionFilter } from '../../../common/exception-filter/ws/ws.exception-filter';
import { WS_ERROR_EVENT } from '../../../common/constants/ws-events.constants';
import {
  ApplicationNotification,
  AppNotificationResultEnum,
  AppNotificationResultType,
  WsNotification,
} from '@app/application-notification';
import { WsResponseDto } from '@app/base-types-enum';
import { WsValidationPipeOption } from '../../../common/pipe/validation/ws-validation-options.pipe';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { ConfigService } from '@nestjs/config';
import { EnvSettings } from '../../../settings/env/env.settings';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import {
  WS_CORS_ALLOWED_HEADERS,
  WS_CORS_METHODS,
  WS_CORS_ORIGIN,
} from '../../../common/constants/ws-cors.constants';
import { JWTAccessTokenPayloadType } from '../../auth/domain/types';

@UseFilters(WsExceptionFilter)
@UsePipes(new ValidationPipe(new WsValidationPipeOption()))
@WebSocketGateway({
  namespace: NOTIFICATION_NAME_SPACE,
  cors: {
    origin: WS_CORS_ORIGIN,
    methods: WS_CORS_METHODS,
    allowedHeaders: WS_CORS_ALLOWED_HEADERS,
  },
})
export class NotificationWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() io: Server;

  private readonly clients: Map<Socket, string> = new Map();
  private readonly userSockets: Map<string, Set<Socket>> = new Map();
  private readonly envSettings: EnvSettings;

  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly wsNotification: WsNotification,
  ) {
    this.logger.setContext(NotificationWsGateway.name);
    this.envSettings = this.configService.get('envSettings');
  }

  private async authConnection(client: Socket): Promise<string | null> {
    this.logger.debug('Execute: auth connection', this.authConnection.name);
    const token = client.handshake?.headers?.authorization as string;
    let userId: string | null = null;
    const unauthorizedPayload: WsResponseDto<null> =
      this.wsNotification.generate(
        'Unauthorized exception',
        AppNotificationResultEnum.Unauthorized,
        null,
      );

    if (!token) {
      this.forceDisconnect(client, unauthorizedPayload);
      return null;
    }

    if (!token.trim()) {
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
      if (!user) {
        this.forceDisconnect(client, unauthorizedPayload);
        return null;
      }
      if (user.userBanInfo) {
        this.forceDisconnect(client, unauthorizedPayload);
        return null;
      }
    } catch (e) {
      this.forceDisconnect(client, unauthorizedPayload);
      return null;
    }

    return userId;
  }

  private clearClient(client: Socket): void {
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

  private forceDisconnect<T = null>(client: Socket, payload: T): void {
    this.logger.debug(
      `Client force disconnected: ${client.id}`,
      this.forceDisconnect.name,
    );
    this.clearClient(client);

    client.emit(WS_ERROR_EVENT, payload);
    client.disconnect();
  }

  async handleConnection(client: Socket, ...args: any[]): Promise<void> {
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
}
