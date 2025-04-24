import { Injectable } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as MessengerPrismaClient } from '@prisma/messenger';
import { MessageWithReadStatusType } from '../domain/types';

@Injectable()
export class MessageQueryRepository {
  constructor(
    private readonly logger: LoggerService,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<MessengerPrismaClient>
    >,
  ) {
    this.logger.setContext(MessageQueryRepository.name);
  }

  async getChatMessages(
    chatId: string,
    pageSize: number,
    endCursorMessageId: string,
  ): Promise<{ items: MessageWithReadStatusType[]; total: number } | null> {
    this.logger.debug('Execute: get chat messages', this.getChatMessages.name);

    let endCursorCreatedAt: Date | undefined = undefined;

    if (endCursorMessageId) {
      const endCursorMessage = await this.txHost.tx.message.findUnique({
        where: {
          id: endCursorMessageId,
        },
        select: {
          createdAt: true,
        },
      });

      if (endCursorMessage) {
        endCursorCreatedAt = endCursorMessage.createdAt;
      }
    }

    const [messages, totalCount] = await Promise.all([
      this.txHost.tx.message.findMany({
        where: {
          chatId,
          ...(endCursorCreatedAt && {
            createdAt: {
              lt: endCursorCreatedAt,
            },
          }),
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          MessageReadStatus: true,
        },
        take: pageSize,
      }),
      this.txHost.tx.message.count({
        where: {
          chatId,
        },
      }),
    ]);

    return {
      items: messages || [],
      total: totalCount || 0,
    };
  }
}
