import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  PrismaClient as GatewayPrismaClient,
  User,
  UserAvatar,
} from '@prisma/gateway';

@Injectable()
export class AvatarRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
  ) {}
  public async setCurrentAvatar(dto: {
    userId: User['id'];
    avatarKey: UserAvatar['avatarKey'];
    createdAt: Date;
  }): Promise<void> {
    await this.txHost.tx.userAvatar.upsert({
      where: { userId: dto.userId },
      update: {
        avatarKey: dto.avatarKey,
        createdAt: dto.createdAt,
      },
      create: {
        userId: dto.userId,
        avatarKey: dto.avatarKey,
        createdAt: dto.createdAt,
      },
    });
  }
  public async getCurrentAvatarKey(
    userId: User['id'],
  ): Promise<UserAvatar['avatarKey'] | null> {
    const result = await this.txHost.tx.userAvatar.findUnique({
      where: { userId },
      select: { avatarKey: true },
    });
    return result ? result.avatarKey : null;
  }
}
