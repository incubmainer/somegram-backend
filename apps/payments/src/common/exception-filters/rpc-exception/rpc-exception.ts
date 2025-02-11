import { ArgumentsHost, Catch, RpcExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcForbiddenException } from '../custom-exception/rpc-forbidden.exception';
import { AppNotificationResultEnum } from '@app/application-notification';
import { RpcUnauthorizedException } from '../custom-exception/rpc-unauthorized.exception';

@Catch(RpcException)
export class RpcCustomExceptionFilter implements RpcExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost): any {
    const ctx = host.switchToRpc();
    const name = exception.name;
    const error = exception.getError();
    const message = exception.message;

    if (name === RpcForbiddenException.name) {
      return {
        appResult: AppNotificationResultEnum.Forbidden,
        data: null,
        errorField: null,
      };
    }

    if (name === RpcUnauthorizedException.name) {
      return {
        appResult: AppNotificationResultEnum.Unauthorized,
        data: null,
        errorField: null,
      };
    }

    return {
      appResult: AppNotificationResultEnum.InternalError,
      data: null,
      errorField: null,
    };
  }
}
