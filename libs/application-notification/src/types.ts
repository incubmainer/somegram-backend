import { AppNotificationResultEnum } from '@app/application-notification/enum';

export type AppNotificationResultType<T, D = null> = {
  data: T;
  errorField?: D;
  appResult: AppNotificationResultEnum;
};
//
