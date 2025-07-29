import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageRepository } from './infrastructure/message.repository';
import { UploadMessageUseCase } from './applications/use-cases/upload-message.use-case';
import { DeleteMessageUseCase } from './applications/use-cases/delete-message.use-case';
import { GetMessageQueryCase } from './applications/query-cases/get-message.query-case';
import { MessageQueryRepository } from './infrastructure/message.query-repository';
import { MessageController } from './api/message.controller';
import { S3Adapter } from '../../common/application/adapters/s3.adapter';
import { Message, MessageSchema } from './models/message-model';

const handlers = [UploadMessageUseCase, DeleteMessageUseCase];
const queryHandlers = [GetMessageQueryCase];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  controllers: [MessageController],
  providers: [
    MessageRepository,
    MessageQueryRepository,
    S3Adapter,
    ...queryHandlers,
    ...handlers,
  ],
})
export class MessengerModule {}
