import { Injectable } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import {
  CreateMessageReadDto,
  CreateNewMessageDto,
  MessageWithReadStatusAndParticipantsType,
} from '../domain/types';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as MessengerPrismaClient } from '@prisma/messenger';
import { MessageEntity } from '../domain/message.entity';

@Injectable()
export class MessageRepository {
  constructor(
    private readonly logger: LoggerService,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<MessengerPrismaClient>
    >,
  ) {
    this.logger.setContext(MessageRepository.name);
  }

  async createMessage(createDto: CreateNewMessageDto): Promise<MessageEntity> {
    this.logger.debug('Execute: save new message', this.createMessage.name);
    const { createdAt, message, chatId, senderId } = createDto;

    const result = await this.txHost.tx.message.create({
      data: {
        createdAt,
        chatId,
        content: message,
        userId: senderId,
        MessageReadStatus: {
          create: {
            createdAt,
            userId: senderId,
          },
        },
      },
    });

    return new MessageEntity(result);
  }

  async createMessageReadStatus(
    createDto: CreateMessageReadDto,
  ): Promise<void> {
    this.logger.debug(
      'Execute: save new message read status',
      this.createMessageReadStatus.name,
    );
    const { createdAt, messageId, userId } = createDto;

    await this.txHost.tx.messageReadStatus.create({
      data: {
        createdAt,
        messageId,
        userId,
      },
    });
  }

  async getMessageByIdWithReadStatus(
    id: string,
  ): Promise<MessageWithReadStatusAndParticipantsType | null> {
    this.logger.debug(
      'Execute: get message by id with read status',
      this.getMessageByIdWithReadStatus.name,
    );
    return this.txHost.tx.message.findUnique({
      where: {
        id,
      },
      include: {
        Chat: {
          select: {
            Participants: true,
          },
        },
        MessageReadStatus: true,
      },
    });
  }
}
