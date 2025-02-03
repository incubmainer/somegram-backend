import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WsUnauthorizedException } from '../../exception-filter/ws/exceptions/ws-unauthorized.exception';

@Injectable()
export class WsJwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  canActivate(context: ExecutionContext): any {
    console.log('AUTH');
    const client: Socket = context.switchToWs().getClient();
    const authToken = client.handshake?.headers?.authorization;

    throw new WsUnauthorizedException();

    // if (!authToken) {
    //   throw new WsException('Unauthorized');
    // }

    //return super.canActivate(context) as boolean;
  }
}
