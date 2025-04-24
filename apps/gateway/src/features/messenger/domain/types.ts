export class CreateMessageDto {
  currentParticipantId: string;
  participantId: string;
  message: string;
}

export class ReadMessageDto {
  userId: string;
  messageId: string;
}
