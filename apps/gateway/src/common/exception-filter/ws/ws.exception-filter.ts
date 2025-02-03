import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WsUnauthorizedException } from './exceptions/ws-unauthorized.exception';
import { WS_ERROR_EVENT } from '../../constants/ws-events.constants';
import { WsForbiddenException } from './exceptions/ws-forbidden.exception';

@Catch(WsException)
export class WsExceptionFilter implements ExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost): void {
    const client: Socket = host.switchToWs().getClient();
    const message = exception.message || 'Internal Server Error';
    const name = exception.name;

    if (name === WsUnauthorizedException.name) {
      client.emit(WS_ERROR_EVENT, {
        message: message,
      });
      client.disconnect();
      return;
    }

    if (name === WsForbiddenException.name) {
      client.emit(WS_ERROR_EVENT, {
        message: message,
      });
      client.disconnect();
      return;
    }

    // Отправляем ошибку клиенту
    client.emit('error', {
      message: message,
    });
  }
}
