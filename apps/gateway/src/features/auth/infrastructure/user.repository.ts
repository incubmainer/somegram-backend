import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  PrismaClient as GatewayPrismaClient,
  User,
  UserConfirmationToken,
} from '@prisma/gateway';

@Injectable()
export class UserRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
  ) {}
  public async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.txHost.tx.user.findFirst({
      where: {
        email,
      },
    });
    return user;
  }
  public async getUserByUsername(username: string): Promise<User | null> {
    const user = await this.txHost.tx.user.findFirst({
      where: {
        username,
      },
    });
    return user;
  }
  public async deleteUserById(id: User['id']): Promise<void> {
    await this.txHost.tx.user.delete({
      where: {
        id: id,
      },
    });
  }
  public async createNotConfirmedUser(dto: {
    username: User['username'];
    email: User['email'];
    hashPassword: User['hashPassword'];
    createdAt: Date;
    confirmationToken: UserConfirmationToken['token'];
    confirmationTokenExpiresAt: UserConfirmationToken['expiredAt'];
  }) {
    await this.txHost.tx.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        hashPassword: dto.hashPassword,
        createdAt: dto.createdAt,
        isConfirmed: false,
        confirmationToken: {
          create: {
            token: dto.confirmationToken,
            createdAt: dto.createdAt,
            expiredAt: dto.confirmationTokenExpiresAt,
          },
        },
      },
    });
  }
}
