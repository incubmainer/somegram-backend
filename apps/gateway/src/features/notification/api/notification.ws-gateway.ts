import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NOTIFICATION_NAME_SPACE } from '../../../common/constants/route.constants';
import { LoggerService } from '@app/logger';
import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WsJwtAuthGuard } from '../../../common/guards/ws-jwt/ws-jwt-auth.guard';
import { WsExceptionFilter } from '../../../common/exception-filter/ws/ws.exception-filter';
import {
  WS_ERROR_EVENT,
  WS_MARK_NOTIFICATION_EVENT,
  WS_NOTIFICATION_READ_EVENT,
  WS_NOTIFICATIONS_EVENT,
} from '../../../common/constants/ws-events.constants';
import {
  ApplicationNotification,
  AppNotificationResultEnum,
  AppNotificationResultType,
  WsNotification,
} from '@app/application-notification';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MarkNotificationAsReadUseCases } from '../application/use-cases/mark-as-read.use-cases';
import { MarkNotificationAsReadInputDto } from './dto/input-dto/notification.input-dto';
import { WsResponseDto } from '@app/base-types-enum';
import { WsValidationPipeOption } from '../../../common/pipe/validation/ws-validation-options.pipe';
import { WsNotFoundException } from '../../../common/exception-filter/ws/exceptions/ws-not-found.exception';
import { WsForbiddenException } from '../../../common/exception-filter/ws/exceptions/ws-forbidden.exception';
import { WsInternalErrorException } from '../../../common/exception-filter/ws/exceptions/ws-internal-error.exception';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { ConfigService } from '@nestjs/config';
import { EnvSettings } from '../../../settings/env/env.settings';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../../../common/constants/jwt-basic-constants';
import { JWTAccessTokenPayloadType } from '../../../common/domain/types/types';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { WsCurrentUserId } from '../../../common/decorators/ws-parse/ws-current-user-id';
import { GetNotificationsByUserIdQueryCommand } from '../application/query/get-notifications.query.command';
import { NotificationOutputDto } from './dto/output-dto/notification.output.dto';

@UseFilters(WsExceptionFilter)
@UsePipes(new ValidationPipe(new WsValidationPipeOption()))
@WebSocketGateway({ namespace: NOTIFICATION_NAME_SPACE })
export class NotificationWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() io: Server;

  private readonly clients: Map<Socket, string> = new Map();
  private readonly envSettings: EnvSettings;

  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
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
      // TODO Secret из ENVSettings полсе окончания рефакторинга auth можно будет изменить
      const result: JWTAccessTokenPayloadType = this.jwtService.verify(
        splitToken[1],
        {
          secret: jwtConstants.JWT_SECRET,
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

  private async getNotificationAfterConnect(
    userId: string,
  ): Promise<NotificationOutputDto[] | []> {
    const result: AppNotificationResultType<NotificationOutputDto[]> =
      await this.queryBus.execute(
        new GetNotificationsByUserIdQueryCommand(userId),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        return result.data;
      default:
        return [];
    }
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

    const notifications = await this.getNotificationAfterConnect(userId);

    this.clients.set(client, userId);
    client.emit(
      WS_NOTIFICATIONS_EVENT,
      this.wsNotification.generate(
        AppNotificationResultEnum.Success,
        AppNotificationResultEnum.Success,
        notifications,
      ),
    );
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

  @SubscribeMessage(WS_MARK_NOTIFICATION_EVENT)
  @UseGuards(WsJwtAuthGuard)
  async readNotification(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: MarkNotificationAsReadInputDto,
    @WsCurrentUserId() userId: string,
  ): Promise<void> {
    this.logger.debug('Execute: read message', this.readNotification.name);

    const result: AppNotificationResultType<null> =
      await this.commandBus.execute(
        new MarkNotificationAsReadUseCases(userId, body.notificationId),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.readNotification.name);
        client.emit(
          WS_NOTIFICATION_READ_EVENT,
          this.wsNotification.generate(
            result.appResult,
            result.appResult,
            null,
          ),
        );
        return;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug('Not Found', this.readNotification.name);
        throw new WsNotFoundException();
      case AppNotificationResultEnum.Forbidden:
        this.logger.debug('Forbidden', this.readNotification.name);
        throw new WsForbiddenException();
      default:
        throw new WsInternalErrorException();
    }
  }
}
