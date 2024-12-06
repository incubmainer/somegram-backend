import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const ClientInfo = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest<Request>();

    const forwardedFor = req.headers['x-forwarded-for'] as string;
    const ip =
      forwardedFor?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown';

    const userAgent = req.headers['user-agent'] || 'unknown';

    return {
      ip,
      userAgent,
    };
  },
);
