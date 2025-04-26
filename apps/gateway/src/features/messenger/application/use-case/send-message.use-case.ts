import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CreateMessageDto } from '../../domain/types';
import { MessengerServiceAdapter } from '../../../../common/adapter/messenger-service.adapter';
import {
  ChatMessagesOutputDto,
  ChatMessagesOutputDtoMapper,
} from '../../api/dto/output-dto/get-chat-messages.output.dto';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';

export class SendMessageCommand implements ICommand {
  constructor(
    public currentUserId: string,
    public participantId: string,
    public message: string,
  ) {}
}

@CommandHandler(SendMessageCommand)
export class SendMessageUseCase
  implements
    ICommandHandler<
      SendMessageCommand,
      AppNotificationResultType<ChatMessagesOutputDto>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly usersRepository: UsersRepository,
    private readonly messengerServiceAdapter: MessengerServiceAdapter,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly chatMessagesOutputDtoMapper: ChatMessagesOutputDtoMapper,
  ) {
    this.logger.setContext(SendMessageUseCase.name);
  }

  async execute(
    command: SendMessageCommand,
  ): Promise<AppNotificationResultType<ChatMessagesOutputDto>> {
    this.logger.debug('Execute: send message command', this.execute.name);
    const { currentUserId, message, participantId } = command;
    try {
      const participant = this.usersRepository.getUserById(participantId);

      if (!participant) return this.appNotification.notFound();

      const data: CreateMessageDto = {
        message,
        currentParticipantId: currentUserId,
        participantId: participantId,
      };

      const result = await this.messengerServiceAdapter.sendMessage(data);

      if (result.appResult !== AppNotificationResultEnum.Success)
        return result as AppNotificationResultType<null>;

      const ids = [currentUserId, participantId];

      const avatars = await this.photoServiceAdapter.getUsersAvatar(ids);

      const users = await this.usersQueryRepository.getUsersAndUsersIsBan(ids);

      const messageResult = this.chatMessagesOutputDtoMapper.mapMessage(
        result.data,
        avatars,
        users,
      );

      return this.appNotification.success(messageResult);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
