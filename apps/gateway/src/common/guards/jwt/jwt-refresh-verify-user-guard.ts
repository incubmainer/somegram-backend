import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JWTRefreshTokenPayloadType } from '../../../features/auth/domain/types';

@Injectable()
export class RefreshJWTVerifyUserGuard extends AuthGuard(
  'jwt-refresh-token-verify-user',
) {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = JWTRefreshTokenPayloadType>(
    err: any,
    user: TUser,
  ): TUser {
    if (err || !user) {
      return null;
    }
    return user;
  }
}
