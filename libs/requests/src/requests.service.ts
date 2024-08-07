import { Inject, Injectable } from '@nestjs/common';
import { RequestsModuleOptionsToken } from './requests.constants';
import { RequestsModuleOptions } from './requests.interface';

@Injectable()
export class RequestsService {
  constructor(
    @Inject(RequestsModuleOptionsToken)
    private readonly options: RequestsModuleOptions,
  ) {}
  getMiddleware() {
    const middleware = (req, res, next) => {
      const keyValue = {};
      for (const field of this.options.fields) {
        let headerValue = req.headers[field.fieldName] as string;
        if (!headerValue) headerValue = field.generator();
        keyValue[field.fieldName] = headerValue;
        if (field.returnInResponse && field.returnInResponse())
          res.setHeader(field.fieldName, headerValue);
      }
      this.options.cb(keyValue, next);
    };
    return middleware;
  }
}
