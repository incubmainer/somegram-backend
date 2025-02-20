import { Observable } from 'rxjs';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MeOutputDto } from '../../../features/auth/api/dto/output-dto/me-output-dto';

export class MeAccessTokenGuard extends AuthGuard('me-jwt-access-token') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<TUser = MeOutputDto>(err: any, user: TUser): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    return user as TUser;
  }
}
