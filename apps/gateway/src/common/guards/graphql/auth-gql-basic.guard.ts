import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGqlBasicGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const args = ctx.getArgs();
    const { loginInput } = args;
    const { email, password } = loginInput || {};

    const validEmail = this.configService.get<string>('BASIC_AUTH_EMAIL');
    const validPassword = this.configService.get<string>('BASIC_AUTH_PASSWORD');

    if (email !== validEmail || password !== validPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return true;
  }
}
