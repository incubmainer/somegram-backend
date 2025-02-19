import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GoogleProfile } from '../../../../common/guards/jwt/google.strategy';

export const GoogleUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): GoogleProfile | null => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return null;
    const googleProfile = user.googleProfile;
    if (!googleProfile) return null;
    return googleProfile;
  },
);
