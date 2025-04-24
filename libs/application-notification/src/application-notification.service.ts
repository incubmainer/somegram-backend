import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AppNotificationResultEnum } from '@app/application-notification/enum';
import { AppNotificationResultType } from '@app/application-notification/types';
import { WsNotFoundException } from 'apps/gateway/src/common/exception-filter/ws/exceptions/ws-not-found.exception';
import { WsUnauthorizedException } from '../../../apps/gateway/src/common/exception-filter/ws/exceptions/ws-unauthorized.exception';
import { WsForbiddenException } from '../../../apps/gateway/src/common/exception-filter/ws/exceptions/ws-forbidden.exception';
import { WsInternalErrorException } from '../../../apps/gateway/src/common/exception-filter/ws/exceptions/ws-internal-error.exception';
import { WsUnprocessableEntityException } from '../../../apps/gateway/src/common/exception-filter/ws/exceptions/ws-unprocessable-entity.exception';

@Injectable()
export class ApplicationNotification {
  success<T>(data: T): AppNotificationResultType<T> {
    return {
      appResult: AppNotificationResultEnum.Success,
      data: data,
      errorField: null,
    };
  }

  badRequest<T, D = null>(
    data: T,
    additionally?: D,
  ): AppNotificationResultType<D, T> {
    return {
      appResult: AppNotificationResultEnum.BadRequest,
      data: additionally,
      errorField: data,
    };
  }

  notFound<T>(): AppNotificationResultType<T> {
    return {
      appResult: AppNotificationResultEnum.NotFound,
      data: null,
      errorField: null,
    };
  }

  unauthorized<T = null, D = null>(
    data?: T,
    error?: D,
  ): AppNotificationResultType<T, D> {
    return {
      appResult: AppNotificationResultEnum.Unauthorized,
      data: data,
      errorField: error,
    };
  }

  forbidden<T = null, D = null>(
    data?: T,
    error?: D,
  ): AppNotificationResultType<T, D> {
    return {
      appResult: AppNotificationResultEnum.Forbidden,
      data: data,
      errorField: error,
    };
  }

  internalServerError<T>(): AppNotificationResultType<T> {
    return {
      appResult: AppNotificationResultEnum.InternalError,
      data: null,
      errorField: null,
    };
  }

  handleHttpResult<T, D>(result: AppNotificationResultType<T, D | null>): void {
    const errorMap = {
      [AppNotificationResultEnum.NotFound]: () => {
        throw new NotFoundException();
      },
      [AppNotificationResultEnum.BadRequest]: () => {
        throw new BadRequestException(result.errorField);
      },
      [AppNotificationResultEnum.Unauthorized]: () => {
        throw new UnauthorizedException();
      },
      [AppNotificationResultEnum.Forbidden]: () => {
        throw new ForbiddenException();
      },
      [AppNotificationResultEnum.UnprocessableEntity]: () => {
        throw new UnprocessableEntityException(result.errorField);
      },
    };

    if (result.appResult === AppNotificationResultEnum.Success) {
      return;
    }

    (
      errorMap[result.appResult] ||
      (() => {
        throw new InternalServerErrorException();
      })
    )();
  }

  handleWsResult<T, D>(result: AppNotificationResultType<T, D | null>): void {
    const errorMap = {
      [AppNotificationResultEnum.NotFound]: () => {
        throw new WsNotFoundException();
      },
      [AppNotificationResultEnum.Unauthorized]: () => {
        throw new WsUnauthorizedException();
      },
      [AppNotificationResultEnum.Forbidden]: () => {
        throw new WsForbiddenException();
      },
      [AppNotificationResultEnum.UnprocessableEntity]: () => {
        throw new WsUnprocessableEntityException(result.errorField as object);
      },
    };

    if (result.appResult === AppNotificationResultEnum.Success) {
      return;
    }

    (
      errorMap[result.appResult] ||
      (() => {
        throw new WsInternalErrorException();
      })
    )();
  }
}
