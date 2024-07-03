import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/gateway';

@Injectable()
export class GatewayService {
  constructor(private readonly prisma: PrismaClient) { }
  async getUsers(): Promise<User[]> {
    const user = await this.prisma.user.findMany();
    return user;
  }
}
