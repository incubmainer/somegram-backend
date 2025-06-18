import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { NOTIFICATION_NAME_SPACE } from '../../../common/constants/route.constants';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  WsNotification,
} from '@app/application-notification';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import {
  WS_CORS_ALLOWED_HEADERS,
  WS_CORS_METHODS,
  WS_CORS_ORIGIN,
} from '../../../common/constants/ws-cors.constants';
import { WsGateway } from '../../../common/services/ws-gateway/ws.gateway';

@WebSocketGateway({
  namespace: NOTIFICATION_NAME_SPACE,
  cors: {
    origin: WS_CORS_ORIGIN,
    methods: WS_CORS_METHODS,
    allowedHeaders: WS_CORS_ALLOWED_HEADERS,
  },
})
export class NotificationWsGateway
  extends WsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    logger: LoggerService,
    appNotification: ApplicationNotification,
    configService: ConfigService<ConfigurationType, true>,
    jwtService: JwtService,
    usersRepository: UsersRepository,
    wsNotification: WsNotification,
  ) {
    super(
      logger,
      appNotification,
      configService,
      jwtService,
      usersRepository,
      wsNotification,
    );
    this.logger.setContext(NotificationWsGateway.name);
  }
}
