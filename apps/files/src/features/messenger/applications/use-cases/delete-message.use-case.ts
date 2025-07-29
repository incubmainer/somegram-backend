import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteMessageInputDto } from '../../api/dto/input/delete-message.input.dto';
import { S3Adapter } from '../../../../common/application/adapters/s3.adapter';
import { MessageRepository } from '../../infrastructure/message.repository';

export class DeleteMessageCommand {
  constructor(public payload: DeleteMessageInputDto) {}
}

@CommandHandler(DeleteMessageCommand)
export class DeleteMessageUseCase
  implements ICommandHandler<DeleteMessageCommand>
{
  constructor(
    private readonly s3Adapter: S3Adapter,
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute(command: DeleteMessageCommand): Promise<null> {
    const { messagesIds } = command.payload;
    try {
      const messages =
        await this.messageRepository.getMessagesByIds(messagesIds);

      if (!messages) return null;

      await Promise.all([
        messages.map((m) => this.s3Adapter.deleteImage(m.key)),
        this.messageRepository.deleteByMessagesIds(messagesIds),
      ]);
      return null;
    } catch (e) {
      console.error('Delete messages error: ', e);
      return;
    }
  }
}
