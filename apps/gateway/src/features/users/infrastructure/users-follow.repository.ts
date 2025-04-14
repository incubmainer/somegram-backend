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

  async followToUser(followerId: string, followeeId: string): Promise<boolean> {
    this.logger.debug(
      `Execute: ${followerId} follow to user ${followeeId}`,
      this.followToUser.name,
    );

    const existingFollow = await this.txHost.tx.userFollow.findUnique({
      where: {
        unique_follow: { followerId, followeeId },
      },
    });

    if (existingFollow) {
      this.logger.debug(`User ${followerId} already follows ${followeeId}`);
      return false;
    }

    await this.txHost.tx.userFollow.create({
      data: {
        followerId,
        followeeId,
        createdAt: new Date(),
      },
    });
    return true;
  }

  async unfollowToUser(
    followerId: string,
    followeeId: string,
  ): Promise<boolean> {
    this.logger.debug(
      `Execute: ${followerId} unfollow to user ${followeeId}`,
      this.unfollowToUser.name,
    );

    const existingFollow = await this.txHost.tx.userFollow.findUnique({
      where: {
        unique_follow: { followerId, followeeId },
      },
    });

    if (!existingFollow) {
      this.logger.debug(`User ${followerId} does not follow ${followeeId}`);
      return false;
    }

    await this.txHost.tx.userFollow.delete({
      where: {
        unique_follow: { followerId, followeeId },
      },
    });
    return true;
  }

  async isFollowing(followerId: string, followeeId: string): Promise<boolean> {
    const follow = await this.txHost.tx.userFollow.findUnique({
      where: {
        unique_follow: {
          followerId,
          followeeId,
        },
      },
    });
    return !!follow;
  }

  async isFollowedBy(followeeId: string, followerId: string): Promise<boolean> {
    return this.isFollowing(followerId, followeeId);
  }
}
