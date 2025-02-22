import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { CreatedPostDto } from '../domain/types';
import { PostEntity } from '../domain/post.entity';
import { LoggerService } from '@app/logger';

@Injectable()
export class PostsRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PostsRepository.name);
  }

  public async addPost(createdPostDto: CreatedPostDto): Promise<PostEntity> {
    this.logger.debug('Execute: add new post', this.addPost.name);
    const post = await this.txHost.tx.userPost.create({
      data: {
        createdAt: createdPostDto.createdAt,
        userId: createdPostDto.userId,
        description: createdPostDto.description,
      },
    });

    return new PostEntity(post);
  }

  public async getPostById(postId: string): Promise<PostEntity | null> {
    this.logger.debug(
      `Execute: get post by id: ${postId}`,
      this.getPostById.name,
    );

    const post = await this.txHost.tx.userPost.findFirst({
      where: {
        id: postId,
      },
    });
    return post ? new PostEntity(post) : null;
  }

  public async updatePost(post: PostEntity): Promise<void> {
    this.logger.debug(`Execute: update post`, this.updatePost.name);
    await this.txHost.tx.userPost.update({
      data: {
        description: post.description,
        updatedAt: post.updatedAt,
      },
      where: {
        id: post.id,
      },
    });
  }
  public async deletePost(postId: string): Promise<void> {
    this.logger.debug(`Execute: delete post`, this.deletePost.name);
    await this.txHost.tx.userPost.delete({
      where: {
        id: postId,
      },
    });
  }
}
