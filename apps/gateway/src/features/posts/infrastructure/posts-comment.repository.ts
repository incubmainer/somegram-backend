import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { CreatedPostCommentDto } from '../domain/types';
import { LoggerService } from '@app/logger';
import { PostCommentEntity } from '../domain/post-comment.entity';

@Injectable()
export class PostsCommentRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PostsCommentRepository.name);
  }

  public async addComment(
    createdCommentDto: CreatedPostCommentDto,
  ): Promise<void> {
    this.logger.debug(
      'Execute: add new comment for post',
      this.addComment.name,
    );
    const { commentatorId, postId, createdAt, text, answerForCommentId } =
      createdCommentDto;
    await this.txHost.tx.postComment.create({
      data: {
        createdAt,
        commentatorId,
        text,
        postId,
        answerForCommentId,
      },
    });
  }

  public async getCommentById(
    commentId: string,
  ): Promise<PostCommentEntity | null> {
    this.logger.debug('Execute: get comment by id', this.getCommentById.name);
    const result = await this.txHost.tx.postComment.findUnique({
      where: {
        id: commentId,
      },
    });

    return result ? new PostCommentEntity(result) : null;
  }
}
