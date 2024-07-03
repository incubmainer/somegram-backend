import { Controller, Get } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { User } from '@prisma/gateway';

@Controller('users')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) { }

  @Get()
  async getUsers(): Promise<User[]> {
    const users = await this.gatewayService.getUsers();
    return users;
  }
}
