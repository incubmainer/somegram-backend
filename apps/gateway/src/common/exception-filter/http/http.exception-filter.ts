import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UnprocessableExceptionErrorDto } from '@app/base-types-enum';
import { GqlArgumentsHost, GqlContextType } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const hostType = host.getType<GqlContextType>();

    if (hostType === 'graphql') {
      if (exception instanceof HttpException) {
        const gqlHost = GqlArgumentsHost.create(host);
        const response = exception.getResponse();
        const status = exception.getStatus();
        const messageResponse = exception.message;
        throw new GraphQLError(messageResponse, {
          extensions: {
            statusCode: status,
            message: response,
            code: status,
          },
        });
      }

      throw new GraphQLError('Internal server error');
    }
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    let message: string = 'Internal Server Error';

    if (status === HttpStatus.UNPROCESSABLE_ENTITY) {
      // TODO Протипизировать нормльно
      const responseBody: any = exception.getResponse();
      message = 'Validation failed';
      const errors: UnprocessableExceptionErrorDto[] = [];

      if (Array.isArray(responseBody.message)) {
        responseBody.message.forEach((e) => {
          errors.push({
            property: e.property,
            constraints: e.constraints,
          });
        });
      } else {
        errors.push(responseBody);
      }

      return response
        .status(status)
        .json({ statusCode: status, message: message, errors });
    }

    if (status === HttpStatus.BAD_REQUEST) {
      // TODO Протипизировать нормльно
      const responseBody: any = exception.getResponse();

      return response.status(status).json(responseBody);
    }

    if (status === HttpStatus.UNAUTHORIZED) {
      message = 'Unauthorized';
    }

    if (status === HttpStatus.FORBIDDEN) {
      message = 'Forbidden';
    }

    if (status === HttpStatus.NOT_FOUND) {
      message = 'Not Found';
    }

    response.status(status).json({
      statusCode: status,
      message: message,
    });
  }
}
