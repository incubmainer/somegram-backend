import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { LoggerService } from '@app/logger';

@Injectable()
export class UsersFollowRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UsersFollowRepository.name);
  }

  async followToUser(userId: string, followeeId: string): Promise<boolean> {
    this.logger.debug(
      `Execute: ${userId} follow to user ${followeeId}`,
      this.followToUser.name,
    );

    const existingFollow = await this.txHost.tx.userFollow.findUnique({
      where: {
        unique_follow: { followerId: userId, followeeId: followeeId },
      },
    });

    if (existingFollow) {
      this.logger.debug(`User ${userId} already follows ${followeeId}`);
      return false;
    }

    await this.txHost.tx.userFollow.create({
      data: {
        followerId: userId,
        followeeId: followeeId,
        createdAt: new Date(),
      },
    });
    return true;
  }
}
