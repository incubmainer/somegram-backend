import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { CreatePostLikeDto } from '../domain/types';
import { LoggerService } from '@app/logger';
import { LikePostEntity } from '../domain/like.entity';

@Injectable()
export class PostsLikeRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PostsLikeRepository.name);
  }

  public async addLike(createdDto: CreatePostLikeDto): Promise<void> {
    this.logger.debug('Execute: add new like for post', this.addLike.name);
    const { postId, updatedAt, createdAt, status, userId } = createdDto;
    await this.txHost.tx.likesPost.create({
      data: {
        postId,
        userId,
        status,
        createdAt,
        updatedAt,
      },
    });
  }

  public async updateLike(like: LikePostEntity): Promise<void> {
    this.logger.debug('Execute: update post like ', this.updateLike.name);
    await this.txHost.tx.likesPost.update({
      where: {
        id: like.id,
      },
      data: {
        status: like.status,
        updatedAt: like.updatedAt,
      },
    });
  }

  public async getLikeByPostIdAndUserId(
    postId: string,
    userId: string,
  ): Promise<LikePostEntity | null> {
    this.logger.debug(
      'Execute: get post like by post id and user id',
      this.getLikeByPostIdAndUserId.name,
    );
    const result = await this.txHost.tx.likesPost.findFirst({
      where: {
        postId,
        userId,
      },
    });

    return result ? new LikePostEntity(result) : null;
  }
}
