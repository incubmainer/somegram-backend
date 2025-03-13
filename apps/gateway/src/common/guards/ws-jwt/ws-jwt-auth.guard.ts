import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Socket } from 'socket.io';
import { WsUnauthorizedException } from '../../exception-filter/ws/exceptions/ws-unauthorized.exception';
import { JWTAccessTokenPayloadType } from '../../../features/auth/domain/types';

@Injectable()
export class WsJwtAuthGuard extends AuthGuard('ws-jwt') implements CanActivate {
  canActivate(context: ExecutionContext): any {
    const client: Socket = context.switchToWs().getClient();
    const authToken = client.handshake?.headers?.authorization;

    if (!authToken) throw new WsUnauthorizedException();

    return super.canActivate(context);
  }

  handleRequest<T extends JWTAccessTokenPayloadType>(
    err: any,
    user: T,
    _: undefined,
    context: ExecutionContext,
  ): T {
    if (err || !user) throw new WsUnauthorizedException();

    const userId = user.userId;

    const client: Socket = context.switchToWs().getClient<Socket>();

    client.data.user = { userId };
    return client.data.user;
  }
}
