import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AsyncLocalStorageService } from '@app/logger/als/als.service';
import { v4 as uuidv4 } from 'uuid';

export const REQUEST_ID_KEY = 'requestId';

@Injectable()
export class RequestsContextMiddleware implements NestMiddleware {
  constructor(
    private readonly asyncLocalStorageService: AsyncLocalStorageService,
  ) {}
  use(req: Request, res: Response, next: NextFunction): void {
    let requestId = req.headers['x-request-id'] as string;
    const date: Date = new Date();
    const format: string = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
    if (!requestId) {
      requestId = `${format}-${uuidv4()}`;
      req.headers['x-request-id'] = requestId;
    }
    res.setHeader('X-Request-Id', requestId);

    this.asyncLocalStorageService.start(() => {
      const store = this.asyncLocalStorageService.getStore();

      if (store) {
        store.set(REQUEST_ID_KEY, requestId);
      }

      next();
    });
  }
}
