import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const EntityId = createParamDecorator(
  (param: 'id' | 'postId' | 'userId' = 'id', context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest<Request>();
    const id = req.params[param];
    const value = Number(id);
    if (isNaN(value)) {
      return 0;
    }
    return value;
  },
);
