import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadMessageInputDto } from '../../api/dto/input/upload-message.input.dto';
import { S3Adapter } from '../../../../common/application/adapters/s3.adapter';
import { MessageRepository } from '../../infrastructure/message.repository';
import { parseBuffer } from 'music-metadata';
import { IMessage, MessageTypeEnum } from '../../models/types';
import { FileDto } from '../../../../../../gateway/src/features/posts/api/dto/input-dto/add-post.dto';

export class UploadMessageCommand {
  constructor(public payload: UploadMessageInputDto) {}
}

@CommandHandler(UploadMessageCommand)
export class UploadMessageUseCase
  implements ICommandHandler<UploadMessageCommand>
{
  constructor(
    private readonly s3Adapter: S3Adapter,
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute(command: UploadMessageCommand) {
    const { payload } = command;
    const { messageId, message, chatId, ownerId, participantId, type } =
      payload;
    try {
      const savedMessage = await this.s3Adapter.saveMessage(
        chatId,
        messageId,
        message,
      );

      const newMessageMetadata: IMessage = {
        ownerId,
        participantId,
        chatId: chatId,
        mimeType: message.mimetype,
        messageId: messageId,
        duration: null,
        key: savedMessage.key,
        size: message.size,
        createdAt: new Date(),
      };

      if (type === MessageTypeEnum.VOICE) {
        await this.getDuration(message, newMessageMetadata);
      }

      const newMessage =
        await this.messageRepository.create(newMessageMetadata);

      return this.s3Adapter.getFileUrl(newMessage.key);
    } catch (e) {
      console.error('Upload message error: ', e);
      return null;
    }
  }

  async getDuration(message: FileDto, messageInfo: IMessage): Promise<void> {
    const extractedBuffer = Buffer.from(message.buffer);

    const metadata = await parseBuffer(extractedBuffer, message.mimetype);

    messageInfo.duration = metadata.format.duration;
  }
}
