export interface ISound {
  ownerId: string;
  participantId: string;
  key: string;
  size: number;
  duration: number; // Second
  createdAt: Date;
  mimeType: string;
  messageId: string;
  chatId: string;
}
