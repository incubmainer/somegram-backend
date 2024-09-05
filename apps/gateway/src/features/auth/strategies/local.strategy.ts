import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';

@LogClass({
  level: 'trace',
  loggerClassField: 'logger',
  active: () => process.env.NODE_ENV !== 'production',
})
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    @InjectCustomLoggerService() private readonly logger: CustomLoggerService,
  ) {
    super({
      usernameField: 'email',
    });
    logger.setContext(LocalStrategy.name);
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    console.log('🚀 ~ LocalStrategy ~ validate ~ user:', user);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
