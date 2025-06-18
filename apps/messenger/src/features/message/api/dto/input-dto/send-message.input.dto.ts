import { MessageTypeEnum } from '../../../domain/types';

export class SendMessageInputDto {
  currentParticipantId: string;
  participantId: string;
  message: string;
  type: MessageTypeEnum;
}
