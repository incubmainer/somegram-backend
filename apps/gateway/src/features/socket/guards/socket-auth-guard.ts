import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

import { UsersQueryRepository } from '../../users/infrastructure/users.query-repository';

@Injectable()
export class SocketAuthGuard implements CanActivate {
  constructor(
    private readonly usersQueryRepo: UsersQueryRepository,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();

    const token = client.handshake.query.token as string;

    if (!token) {
      new WsException('Missing token');
      return false;
    }

    const decodedToken = this.jwtService.decode(token);

    const user = await this.usersQueryRepo.findUserById(decodedToken.userId);

    if (!user) {
      new WsException('Unauthorized');
      return false;
    }

    return true;
  }
}
