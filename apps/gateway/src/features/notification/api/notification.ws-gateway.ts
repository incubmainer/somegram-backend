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
import { JWTAccessTokenPayloadType } from '../../../common/domain/types/types';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import {
  WS_CORS_ALLOWED_HEADERS,
  WS_CORS_METHODS,
  WS_CORS_ORIGIN,
} from '../../../common/constants/ws-cors.constants';

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
    } catch (e) {
      this.forceDisconnect(client, unauthorizedPayload);
      return null;
    }

    return userId;
  }

  private forceDisconnect<T = null>(client: Socket, payload: T): void {
    this.logger.debug(
      `Client force disconnected: ${client.id}`,
      this.forceDisconnect.name,
    );
    this.clients.delete(client);
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
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(
      `Client disconnected: ${client.id}`,
      this.handleDisconnect.name,
    );
    this.clients.delete(client);
  }

  public emitMessageByUserId<T = null>(
    userId: string,
    event: string,
    payload: T,
  ): AppNotificationResultType<null> {
    this.logger.debug(
      'Execute: send message to connected client by user id',
      this.emitMessageByUserId.name,
    );
    let client: Socket | undefined;

    for (const [socket, storedUserId] of this.clients.entries()) {
      if (storedUserId === userId) {
        client = socket;
        break;
      }
    }

    if (!client) return this.appNotification.notFound();
    client.emit(event, payload);

    return this.appNotification.success(null);
  }
}
