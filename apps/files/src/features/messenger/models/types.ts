export interface IMessage {
  ownerId: string;
  participantId: string;
  key: string;
  size: number;
  duration: number | null; // Second
  createdAt: Date;
  mimeType: string;
  messageId: string;
  chatId: string;
}

export enum MessageTypeEnum {
  VOICE = 'voice',
  FILE = 'file',
}
