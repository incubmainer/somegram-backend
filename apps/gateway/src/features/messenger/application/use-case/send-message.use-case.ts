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
  UploadVoiceDto,
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
  ) {}
}

@CommandHandler(SendMessageCommand)
export class SendMessageUseCase
  implements
    ICommandHandler<SendMessageCommand, AppNotificationResultType<string>>
{
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
  ): Promise<AppNotificationResultType<string>> {
    this.logger.debug('Execute: send message command', this.execute.name);
    const { currentUserId, message, participantId, messageType } = command;
    try {
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
        default:
          return this.appNotification.internalServerError();
      }
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  private async handleTextMessage(
    message: string,
    currentParticipantId: string,
    participantId: string,
  ): Promise<AppNotificationResultType<string>> {
    const data: CreateMessageDto = {
      message,
      currentParticipantId: currentParticipantId,
      participantId: participantId,
      type: MessageTypeEnum.TEXT,
    };

    const result = await this.messengerServiceAdapter.sendMessage(data);

    if (result.appResult !== AppNotificationResultEnum.Success)
      return result as AppNotificationResultType<null>;

    return this.appNotification.success(result.data.chatId);
  }

  private async handleVoiceMessage(
    message: Express.Multer.File,
    currentParticipantId: string,
    participantId: string,
  ): Promise<AppNotificationResultType<string>> {
    const data: CreateMessageDto = {
      message: null,
      currentParticipantId: currentParticipantId,
      participantId: participantId,
      type: MessageTypeEnum.VOICE,
    };

    const result = await this.messengerServiceAdapter.sendMessage(data);

    if (result.appResult !== AppNotificationResultEnum.Success)
      return result as AppNotificationResultType<null>;

    const file: FileDto = {
      buffer: message.buffer,
      mimetype: message.mimetype,
      size: message.size,
      originalname: message.originalname,
    };

    const uploadVoiceDto: UploadVoiceDto = {
      message: file,
      messageId: result.data.messageId,
      chatId: result.data.chatId,
      participantId: participantId,
      ownerId: currentParticipantId,
    };
    await this.photoServiceAdapter.uploadVoiceMessage(uploadVoiceDto);

    return this.appNotification.success(result.data.chatId);
  }
}
