import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { SocketGatewayService } from './socket.gateway.service';

@Module({
  imports: [],
  controllers: [],
  exports: [],
  providers: [SocketGatewayService, JwtService],
})
export class SocketGatewayModule {}
