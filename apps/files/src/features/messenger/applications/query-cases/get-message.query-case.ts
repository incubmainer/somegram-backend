import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMessageInputDto } from '../../api/dto/input/get-message.input.dto';
import { MessageQueryRepository } from '../../infrastructure/message.query-repository';
import { S3Adapter } from '../../../../common/application/adapters/s3.adapter';
import { MessageOutputDto } from '../../api/dto/output/message.output.dto';

export class GetMessageQuery {
  constructor(public payload: GetMessageInputDto) {}
}

@QueryHandler(GetMessageQuery)
export class GetMessageQueryCase implements IQueryHandler<GetMessageQuery> {
  constructor(
    private readonly messageQueryRepository: MessageQueryRepository,
    private readonly s3Adapter: S3Adapter,
  ) {}

  async execute(query: GetMessageQuery): Promise<MessageOutputDto | null> {
    const { messageId } = query.payload;
    try {
      const message =
        await this.messageQueryRepository.getMessageByMessageId(messageId);

      if (!message) return null;

      const messageUrl = this.s3Adapter.getFileUrl(message.key);
      return new MessageOutputDto(messageUrl, message);
    } catch (e) {
      console.error('Get message error', e);
      return null;
    }
  }
}
