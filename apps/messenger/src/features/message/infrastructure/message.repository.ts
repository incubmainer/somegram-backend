import { Injectable } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import {
  CreateMessageReadDto,
  CreateNewMessageDto,
  MessageWithReadStatusAndParticipants,
} from '../domain/types';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as MessengerPrismaClient } from '@prisma/messenger';
import { MessageEntity } from '../domain/message.entity';
import { MessageReadEntity } from '../domain/message-read.entity';
import { ParticipantEntity } from '../../chat/domain/participant.entity';

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
    const { createdAt, messageType, message, chatId, senderId } = createDto;

    const result = await this.txHost.tx.message.create({
      data: {
        createdAt,
        chatId,
        content: message,
        userId: senderId,
        messageType,
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
  ): Promise<MessageWithReadStatusAndParticipants | null> {
    this.logger.debug(
      'Execute: get message by id with read status',
      this.getMessageByIdWithReadStatus.name,
    );
    const result = await this.txHost.tx.message.findUnique({
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

    if (!result) return null;

    const message = new MessageEntity(result);
    const messageReadStatus: MessageReadEntity[] = [];

    if (result.MessageReadStatus && result.MessageReadStatus.length > 0)
      result.MessageReadStatus.map((m) =>
        messageReadStatus.push(new MessageReadEntity(m)),
      );

    return {
      message,
      messageReadStatus:
        messageReadStatus && messageReadStatus.length > 0
          ? messageReadStatus
          : null,
      participants: result.Chat.Participants.map(
        (p) => new ParticipantEntity(p),
      ),
    };
  }
}
