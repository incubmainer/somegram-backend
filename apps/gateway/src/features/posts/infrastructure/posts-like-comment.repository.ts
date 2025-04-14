import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { CreatePostCommentLikeDto } from '../domain/types';
import { LoggerService } from '@app/logger';
import { LikeCommentEntity } from '../domain/like.entity';

@Injectable()
export class PostsLikeCommentRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PostsLikeCommentRepository.name);
  }

  public async addLike(createdDto: CreatePostCommentLikeDto): Promise<void> {
    this.logger.debug('Execute: add new like for comment', this.addLike.name);
    const { commentId, updatedAt, createdAt, status, userId } = createdDto;
    await this.txHost.tx.likesComment.create({
      data: {
        commentId,
        userId,
        status,
        createdAt,
        updatedAt,
      },
    });
  }

  public async updateLike(like: LikeCommentEntity): Promise<void> {
    this.logger.debug('Execute: update comment like ', this.updateLike.name);
    await this.txHost.tx.likesComment.update({
      where: {
        id: like.id,
      },
      data: {
        status: like.status,
        updatedAt: like.updatedAt,
      },
    });
  }

  public async getLikeByCommentIdAndUserId(
    commentId: string,
    userId: string,
  ): Promise<LikeCommentEntity | null> {
    this.logger.debug(
      'Execute: get comment like by comment id and user id',
      this.getLikeByCommentIdAndUserId.name,
    );
    const result = await this.txHost.tx.likesComment.findFirst({
      where: {
        commentId,
        userId,
      },
    });

    return result ? new LikeCommentEntity(result) : null;
  }
}
