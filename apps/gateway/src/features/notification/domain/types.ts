export class CreateNotificationDto {
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}
