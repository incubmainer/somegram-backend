import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WsUnauthorizedException } from './exceptions/ws-unauthorized.exception';
import { WS_ERROR_EVENT } from '../../constants/ws-events.constants';
import { WsForbiddenException } from './exceptions/ws-forbidden.exception';
import { WsUnprocessableEntityException } from './exceptions/ws-unprocessable-entity.exception';
import { AppNotificationResultEnum } from '@app/application-notification';
import {
  UnprocessableExceptionErrorDto,
  WsResponseDto,
} from '@app/base-types-enum';
import { WsNotFoundException } from './exceptions/ws-not-found.exception';

@Catch(WsException)
export class WsExceptionFilter implements ExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost): void {
    const client: Socket = host.switchToWs().getClient();
    const message = exception.message || 'Internal Server Error';
    const name = exception.name;

    let disconnect: boolean = false;
    const responsePayload: WsResponseDto<
      null | UnprocessableExceptionErrorDto[]
    > = {
      message: message,
      status: AppNotificationResultEnum.InternalError,
      payload: null,
    };

    if (name === WsUnauthorizedException.name) {
      disconnect = true;
      responsePayload.status = AppNotificationResultEnum.Unauthorized;
    }

    if (name === WsForbiddenException.name) {
      disconnect = true;
      responsePayload.status = AppNotificationResultEnum.Forbidden;
    }

    if (name === WsUnprocessableEntityException.name) {
      const errors: UnprocessableExceptionErrorDto[] = [];
      const responseBody: any = exception.getError();
      if (Array.isArray(responseBody)) {
        responseBody.forEach((e) => {
          errors.push({
            property: e.property,
            constraints: e.constraints,
          });
        });
      } else {
        errors.push(responseBody);
      }

      responsePayload.status = AppNotificationResultEnum.UnprocessableEntity;
      responsePayload.payload = errors;
    }

    if (name === WsNotFoundException.name)
      responsePayload.status = AppNotificationResultEnum.NotFound;

    client.emit(WS_ERROR_EVENT, responsePayload);
    if (disconnect) client.disconnect();
  }
}
