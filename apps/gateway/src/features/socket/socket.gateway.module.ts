import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { SocketGatewayService } from './socket.gateway.service';
import { UsersQueryRepository } from '../users/infrastructure/users.query-repository';

@Module({
  imports: [],
  controllers: [],
  exports: [],
  providers: [SocketGatewayService, JwtService, UsersQueryRepository],
})
export class SocketGatewayModule {}
