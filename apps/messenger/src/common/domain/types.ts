import { GetChatMessagesOutputDto } from '../../features/message/api/dto/output-dto/get-chat-messages.output.dto';

export class NewMessageGatewayDto {
  message: GetChatMessagesOutputDto;
  participantId: string;
}
