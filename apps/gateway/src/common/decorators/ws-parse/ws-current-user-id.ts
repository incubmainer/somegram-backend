import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsUnauthorizedException } from '../../exception-filter/ws/exceptions/ws-unauthorized.exception';

export const WsCurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const user = client.data?.user;

    if (!user || !user.userId) throw new WsUnauthorizedException();

    return user.userId;
  },
);
