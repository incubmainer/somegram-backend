import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as MessengerPrismaClient } from '@prisma/messenger';
import { LoggerService } from '@app/logger';
import { CreateChatDto } from '../domain/types';
import { MessageEntity } from '../../message/domain/message.entity';
import { ChatEntity } from '../domain/chat.entity';

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

  async createChatWithParticipants(
    createDto: CreateChatDto,
  ): Promise<{ chat: ChatEntity; message: MessageEntity }> {
    this.logger.debug(
      'Execute: create chat with participants',
      this.createChatWithParticipants.name,
    );
    const {
      createdAt,
      participantId,
      currentParticipantId,
      message,
      messageType,
    } = createDto;
    const result = await this.txHost.tx.chat.create({
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
            messageType,
            MessageReadStatus: {
              create: {
                createdAt,
                userId: currentParticipantId,
              },
            },
          },
        },
      },
      include: {
        Messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return {
      chat: new ChatEntity(result),
      message: new MessageEntity(result.Messages[0]),
    };
  }

  async getChatByUserIds(
    currentUserId: string,
    participantId: string,
  ): Promise<ChatEntity | null> {
    this.logger.debug(
      'Execute: get chat by participants id',
      this.getChatByUserIds.name,
    );
    const result = await this.txHost.tx.chat.findFirst({
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

    return result ? new ChatEntity(result) : null;
  }
}
