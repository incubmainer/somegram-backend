import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GithubProfile } from '../../guards/jwt/github.strategy';

export const GithubUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): GithubProfile | null => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return null;
    return user;
  },
);
