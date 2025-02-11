import { AppNotificationResultType } from '@app/application-notification';

export interface IPayPalEventHandler<T> {
  handle(event: T): Promise<AppNotificationResultType<null>>;
}
