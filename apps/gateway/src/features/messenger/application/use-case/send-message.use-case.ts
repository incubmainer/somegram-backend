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
import { SendMessageOutputDto } from '../../../../../../messenger/src/features/message/api/dto/output-dto/send-message.output.dto';

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
      AppNotificationResultType<SendMessageOutputDto>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly usersRepository: UsersRepository,
    private readonly messengerServiceAdapter: MessengerServiceAdapter,
  ) {
    this.logger.setContext(SendMessageUseCase.name);
  }

  async execute(
    command: SendMessageCommand,
  ): Promise<AppNotificationResultType<SendMessageOutputDto>> {
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

      if (result.appResult !== AppNotificationResultEnum.Success) return result;

      return this.appNotification.success(result.data);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
