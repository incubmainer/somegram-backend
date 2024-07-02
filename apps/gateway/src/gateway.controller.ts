import { Controller, Get } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { User } from '@prisma/client';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) { }

  @Get()
  async getUsers(): Promise<User[]> {
    const user = await this.gatewayService.getUsers();
    return user;
  }
}
