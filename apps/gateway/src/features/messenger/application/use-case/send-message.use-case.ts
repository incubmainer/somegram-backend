import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';

import { UsersRepository } from '../../../users/infrastructure/users.repository';
import {
  CreateMessageDto,
  MessageTypeEnum,
  SendMessageDto,
  UploadFileMessageDto,
} from '../../domain/types';
import { MessengerServiceAdapter } from '../../../../common/adapter/messenger-service.adapter';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { FileDto } from '../../../posts/api/dto/input-dto/add-post.dto';

export class SendMessageCommand implements ICommand {
  constructor(
    public currentUserId: string,
    public participantId: string,
    public message: string | Express.Multer.File,
    public messageType: MessageTypeEnum,
    public file?: Express.Multer.File,
  ) {}
}

@CommandHandler(SendMessageCommand)
export class SendMessageUseCase
  implements
    ICommandHandler<
      SendMessageCommand,
      AppNotificationResultType<SendMessageDto>
    >
{
  private newMessageId: string | null = null;
  private currentUserId: string | null = null;

  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly usersRepository: UsersRepository,
    private readonly messengerServiceAdapter: MessengerServiceAdapter,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
  ) {
    this.logger.setContext(SendMessageUseCase.name);
  }

  async execute(
    command: SendMessageCommand,
  ): Promise<AppNotificationResultType<SendMessageDto>> {
    this.logger.debug('Execute: send message command', this.execute.name);
    const { currentUserId, message, participantId, messageType, file } =
      command;
    try {
      this.currentUserId = currentUserId;
      const participant = await this.usersRepository.getUserById(participantId);

      if (!participant) return this.appNotification.notFound();

      switch (messageType) {
        case MessageTypeEnum.TEXT:
          return await this.handleTextMessage(
            message as string,
            currentUserId,
            participantId,
          );
        case MessageTypeEnum.VOICE:
          return await this.handleVoiceMessage(
            message as Express.Multer.File,
            currentUserId,
            participantId,
          );
        case MessageTypeEnum.FILE:
          return await this.handleFileMessage(
            (message as string) || null,
            file,
            currentUserId,
            participantId,
          );
        default:
          return this.appNotification.internalServerError();
      }
    } catch (e) {
      this.logger.error(e, this.execute.name);

      if (this.newMessageId && this.currentUserId) {
        try {
          await this.messengerServiceAdapter.removeMessagesByIds(
            [this.newMessageId],
            this.currentUserId,
          );
        } catch (e) {
          this.logger.error(
            `Catch remove new message error: ${e}`,
            this.execute.name,
          );
        }
      }
      return this.appNotification.internalServerError();
    }
  }

  private async handleTextMessage(
    message: string,
    currentParticipantId: string,
    participantId: string,
  ): Promise<AppNotificationResultType<SendMessageDto>> {
    const data: CreateMessageDto = {
      message,
      currentParticipantId: currentParticipantId,
      participantId: participantId,
      type: MessageTypeEnum.TEXT,
    };

    const result = await this.messengerServiceAdapter.sendMessage(data);

    if (result.appResult !== AppNotificationResultEnum.Success)
      return result as AppNotificationResultType<null>;

    return this.appNotification.success(result.data);
  }

  private async handleVoiceMessage(
    message: Express.Multer.File,
    currentParticipantId: string,
    participantId: string,
  ): Promise<AppNotificationResultType<SendMessageDto>> {
    const data: CreateMessageDto = {
      message: null,
      currentParticipantId: currentParticipantId,
      participantId: participantId,
      type: MessageTypeEnum.VOICE,
    };

    const result = await this.messengerServiceAdapter.sendMessage(data);

    if (result.appResult !== AppNotificationResultEnum.Success)
      return result as AppNotificationResultType<null>;

    this.newMessageId = result.data.messageId;

    const file: FileDto = {
      buffer: message.buffer,
      mimetype: message.mimetype,
      size: message.size,
      originalname: message.originalname,
    };

    const uploadVoiceDto: UploadFileMessageDto = {
      message: file,
      messageId: result.data.messageId,
      chatId: result.data.chatId,
      participantId: participantId,
      ownerId: currentParticipantId,
      type: MessageTypeEnum.VOICE,
    };

    await this.photoServiceAdapter.uploadFileMessage(uploadVoiceDto);

    return this.appNotification.success(result.data);
  }

  private async handleFileMessage(
    message: string | null,
    file: Express.Multer.File,
    currentParticipantId: string,
    participantId: string,
  ): Promise<AppNotificationResultType<SendMessageDto>> {
    const data: CreateMessageDto = {
      message,
      currentParticipantId: currentParticipantId,
      participantId: participantId,
      type: MessageTypeEnum.FILE,
    };

    const result = await this.messengerServiceAdapter.sendMessage(data);

    if (result.appResult !== AppNotificationResultEnum.Success)
      return result as AppNotificationResultType<null>;

    this.newMessageId = result.data.messageId;

    const fileDto: FileDto = {
      buffer: file.buffer,
      mimetype: file.mimetype,
      size: file.size,
      originalname: file.originalname,
    };

    const uploadFileDto: UploadFileMessageDto = {
      message: fileDto,
      messageId: result.data.messageId,
      chatId: result.data.chatId,
      participantId: participantId,
      ownerId: currentParticipantId,
      type: MessageTypeEnum.FILE,
    };
    await this.photoServiceAdapter.uploadFileMessage(uploadFileDto);

    return this.appNotification.success(result.data);
  }
}
