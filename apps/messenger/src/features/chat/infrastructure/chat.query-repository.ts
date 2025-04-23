import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  PrismaClient as MessengerPrismaClient,
  Prisma,
  Chat,
  Participant,
} from '@prisma/messenger';
import { LoggerService } from '@app/logger';
import { ChatRawDto } from '../domain/types';

@Injectable()
export class ChatQueryRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<MessengerPrismaClient>
    >,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ChatQueryRepository.name);
  }

  async getChatsByUserId(
    userId: string,
    limit: number,
    endCursorChatId?: string,
  ): Promise<{ items: ChatRawDto[]; total: number }> {
    this.logger.debug(
      'Execute: get chat by user id',
      this.getChatsByUserId.name,
    );
    let endCursorCreatedAt: Date | undefined;

    if (endCursorChatId) {
      const endCursorChat = await this.txHost.tx.chat.findUnique({
        where: { id: endCursorChatId },
        include: {
          Messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      endCursorCreatedAt = endCursorChat?.Messages?.[0]?.createdAt;
    }

    let cursorCondition = Prisma.sql``;
    if (endCursorCreatedAt) {
      cursorCondition = Prisma.sql`
    AND (
      SELECT m."createdAt"
      FROM "Message" AS m
      WHERE m."chatId" = c."id"
      ORDER BY m."createdAt" DESC
      LIMIT 1
    ) < ${Prisma.raw(`'${endCursorCreatedAt.toISOString()}'`)}`;
    }

    const [items, totalResult] = await Promise.all([
      this.txHost.tx.$queryRaw<any[]>(Prisma.sql`
      select
        c.*,
        (
          select p2."userId"
          from "Participant" as p2
          where p2."chatId" = c."id"
          and (p2."userId" != ${userId} or (select count(*) from "Participant" where "chatId" = c."id") = 1)
          limit 1
        ) as "participantId",

        (
          select row_to_json(sub)
          from (
            select m."id", m."userId", m."createdAt", m."content"
            from "Message" as m
            where m."chatId" = c."id"
            order by m."createdAt" desc
            limit 1
          ) as sub
        ) as "lastMessage",

        (
          select case
            when m."userId" = ${userId} then true
            else false
          end
          from "Message" as m
          where m."chatId" = c."id"
          order by m."createdAt" desc
          limit 1
        ) as "isMine"

      from "Chat" as c
      inner join "Participant" as p on p."chatId" = c."id"
      where p."userId" = ${userId}
      ${cursorCondition}

      order by (
        select "createdAt"
        from "Message" as m
        where m."chatId" = c."id"
        order by m."createdAt" desc
        limit 1
      ) desc
      limit ${limit}
    `),

      this.txHost.tx.$queryRaw<{ count: number }[]>(Prisma.sql`
      select count(*)::int as count
      from "Chat" as c
      inner join "Participant" as p on p."chatId" = c."id"
      where p."userId" = ${userId}
    `),
    ]);

    const total = totalResult?.[0]?.count ?? 0;

    return {
      items,
      total,
    };
  }

  async getChatAndParticipantsByChatId(
    chatId: string,
  ): Promise<{ chat: Chat; participants: Participant[] } | null> {
    this.logger.debug(
      'Execute: get chat by chat id with participants info',
      this.getChatAndParticipantsByChatId.name,
    );
    const result = await this.txHost.tx.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        Participants: true,
      },
    });

    return result
      ? {
          chat: result,
          participants: result.Participants,
        }
      : null;
  }
}
