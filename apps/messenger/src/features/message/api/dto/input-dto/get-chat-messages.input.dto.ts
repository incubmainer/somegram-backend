import { GetChatMessagesQueryParams } from '../../../../../../../gateway/src/features/messenger/api/dto/input-dto/get-chat-messages.query.params';

export class GetChatMessagesInputDto {
  currentParticipantId: string;
  chatId: string;
  query: GetChatMessagesQueryParams;
  endCursorMessageId: string | null;
}
