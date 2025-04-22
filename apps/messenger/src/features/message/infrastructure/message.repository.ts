import { Injectable } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { CreateNewMessageDto } from '../domain/types';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as MessengerPrismaClient } from '@prisma/messenger';

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

  async createMessage(createDto: CreateNewMessageDto): Promise<void> {
    this.logger.debug('Execute: save new message', this.createMessage.name);
    const { createdAt, message, chatId, senderId } = createDto;

    await this.txHost.tx.message.create({
      data: {
        createdAt,
        chatId,
        content: message,
        userId: senderId,
      },
    });
  }
}
