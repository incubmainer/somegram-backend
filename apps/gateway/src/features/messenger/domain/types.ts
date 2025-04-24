import { GetChatMessagesOutputDto } from '../../../../../messenger/src/features/message/api/dto/output-dto/get-chat-messages.output.dto';

export class CreateMessageDto {
  currentParticipantId: string;
  participantId: string;
  message: string;
}

export class ReadMessageDto {
  userId: string;
  messageId: string;
}

export class NewMessageGatewayDto {
  message: GetChatMessagesOutputDto;
  participantId: string;
}
