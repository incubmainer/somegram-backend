import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { PrismaClient as GatewayPrismaClient, Prisma } from '@prisma/gateway';
import { LoggerService } from '@app/logger';
import { SortDirection } from '../../../common/domain/query.types';
import {
  CommentAnswerRawModel,
  LikeStatusEnum,
  PostCommentRawModel,
} from '../domain/types';
import { PostCommentEntity } from '../domain/post-comment.entity';

@Injectable()
export class PostsCommentQueryRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PostsCommentQueryRepository.name);
  }

  async getCommentById(commentId: string): Promise<PostCommentEntity | null> {
    const comment = await this.txHost.tx.postComment.findFirst({
      where: {
        id: commentId,
      },
    });

    return comment ? new PostCommentEntity(comment) : null;
  }

  async getCommentsForPostByPostId(
    postId: string,
    userId: string | null,
    sortBy: string,
    sortDirection: SortDirection,
    skip: number,
    take: number,
  ): Promise<{ comments: PostCommentRawModel[]; count: number }> {
    this.logger.debug(
      'Execute: get comments for post by post id',
      this.getCommentsForPostByPostId.name,
    );

    const sql = Prisma.sql`
       select 
           c.id, 
           c.text, 
           c."commentatorId", 
           c."postId", 
           c."createdAt", 
           u.username,
           coalesce(lc.status, ${LikeStatusEnum.none}) AS "myStatus",
           cast(coalesce(like_count, 0) as integer) as likes,
           cast(coalesce(dislike_count, 0) as integer) as dislikes,
           cast(count(pc.id) as integer) as "answersCount"
       from "PostComment" as c
       left join (
           select "commentId", count(*) as like_count 
           from "LikesComment" lc
           left join "UserBanInfo" ubi on lc."userId" = ubi."userId"
           where lc.status = ${LikeStatusEnum.like} and ubi."userId" is null           
           group by "commentId"
       ) as likes on likes."commentId" = c.id
       left join (
           select "commentId", count(*) as dislike_count 
           from "LikesComment" lc
           left join "UserBanInfo" ubi on lc."userId" = ubi."userId"
           where lc.status = ${LikeStatusEnum.dislike} and ubi."userId" is null
           group by "commentId"
       ) as dislikes on dislikes."commentId" = c.id
       left join "LikesComment" as lc on lc."userId" = ${userId} and lc."commentId" = c.id
       left join "User" as u on u.id = c."commentatorId"
       left join "UserBanInfo" as ubi on ubi."userId" = u.id
       left join "PostComment" as pc on pc."answerForCommentId" = c.id
       where 
           c."postId" = ${postId}
           and ubi."userId" is null
           and c."answerForCommentId" is null
       group by c.id, u.username, lc.status, like_count, dislike_count
       order by
           case when c."commentatorId" = ${userId} then 0 else 1 end, 
           "${Prisma.raw(sortBy)}" ${Prisma.raw(sortDirection)} 
       limit ${take}               
       offset ${skip}      
    `;

    const [result, count] = await Promise.all([
      this.txHost.tx.$queryRaw(sql),
      this.txHost.tx.postComment.count({
        where: {
          postId,
          answerForCommentId: null,
          User: {
            userBanInfo: {
              is: null,
            },
          },
        },
      }),
    ]);

    return { comments: result as PostCommentRawModel[], count };
  }

  async getCommentAnswersByCommentId(
    commentId: string,
    userId: string,
    sortBy: string,
    sortDirection: SortDirection,
    skip: number,
    take: number,
  ): Promise<{ comments: CommentAnswerRawModel[]; count: number }> {
    this.logger.debug(
      'Execute: get comment answers by comment id',
      this.getCommentAnswersByCommentId.name,
    );

    const sql = Prisma.sql`
       select 
           c.id, 
           c.text, 
           c."commentatorId", 
           c."postId", 
           c."createdAt", 
           c."answerForCommentId", 
           u.username,
           coalesce(lc.status, ${LikeStatusEnum.none}) AS "myStatus",
           cast(coalesce(like_count, 0) as integer) as likes,
           cast(coalesce(dislike_count, 0) as integer) as dislikes,
           cast(count(pc.id) as integer) as "answersCount"
       from "PostComment" as c
       left join (
           select "commentId", count(*) as like_count 
           from "LikesComment" lc
           left join "UserBanInfo" ubi on lc."userId" = ubi."userId"
           where lc.status = ${LikeStatusEnum.like} and ubi."userId" is null           
           group by "commentId"
       ) as likes on likes."commentId" = c.id
       left join (
           select "commentId", count(*) as dislike_count 
           from "LikesComment" lc
           left join "UserBanInfo" ubi on lc."userId" = ubi."userId"
           where lc.status = ${LikeStatusEnum.dislike} and ubi."userId" is null
           group by "commentId"
       ) as dislikes on dislikes."commentId" = c.id
       left join "LikesComment" as lc on lc."userId" = ${userId} and lc."commentId" = c.id
       left join "User" as u on u.id = c."commentatorId"
       left join "UserBanInfo" as ubi on ubi."userId" = u.id
       left join "PostComment" as pc on pc."answerForCommentId" = c.id
       where 
           c."answerForCommentId" = ${commentId}
           and ubi."userId" is null
       group by c.id, u.username, lc.status, like_count, dislike_count
       order by
           case when c."commentatorId" = ${userId} then 0 else 1 end, 
           "${Prisma.raw(sortBy)}" ${Prisma.raw(sortDirection)} 
       limit ${take}               
       offset ${skip}      
    `;

    const [result, count] = await Promise.all([
      this.txHost.tx.$queryRaw(sql),
      this.txHost.tx.postComment.count({
        where: {
          answerForCommentId: commentId,
          User: {
            userBanInfo: {
              is: null,
            },
          },
        },
      }),
    ]);

    return { comments: result as CommentAnswerRawModel[], count };
  }
}
