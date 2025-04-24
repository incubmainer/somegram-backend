import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as MessengerPrismaClient, Chat } from '@prisma/messenger';
import { LoggerService } from '@app/logger';
import { CreateChatDto } from '../domain/types';

@Injectable()
export class ChatRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<MessengerPrismaClient>
    >,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ChatRepository.name);
  }

  async createChatWithParticipants(createDto: CreateChatDto): Promise<void> {
    this.logger.debug(
      'Execute: create chat with participants',
      this.createChatWithParticipants.name,
    );
    const { createdAt, participantId, currentParticipantId, message } =
      createDto;
    await this.txHost.tx.chat.create({
      data: {
        createdAt,
        Participants: {
          createMany: {
            data: [
              { createdAt, userId: participantId },
              { createdAt, userId: currentParticipantId },
            ],
          },
        },
        Messages: {
          create: {
            createdAt,
            userId: currentParticipantId,
            content: message,
            MessageReadStatus: {
              create: {
                createdAt,
                userId: currentParticipantId,
              },
            },
          },
        },
      },
    });
  }

  async getChatByUserIds(
    currentUserId: string,
    participantId: string,
  ): Promise<Chat | null> {
    this.logger.debug(
      'Execute: get chat by participants id',
      this.getChatByUserIds.name,
    );
    return this.txHost.tx.chat.findFirst({
      where: {
        AND: [
          {
            Participants: {
              some: { userId: currentUserId },
            },
          },
          {
            Participants: {
              some: { userId: participantId },
            },
          },
        ],
      },
    });
  }
}
