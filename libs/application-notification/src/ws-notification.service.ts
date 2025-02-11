import { Injectable } from '@nestjs/common';
import { AppNotificationResultEnum } from '@app/application-notification/enum';
import { WsResponseDto } from '@app/base-types-enum';

@Injectable()
export class WsNotification {
  generate<T>(
    message: string,
    status: AppNotificationResultEnum,
    payload: T,
  ): WsResponseDto<T> {
    return {
      message: message,
      status: status,
      payload: payload,
    };
  }
}
