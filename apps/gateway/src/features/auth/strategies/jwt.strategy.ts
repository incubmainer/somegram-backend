import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../../../common/config/constants/jwt-basic-constants';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';
import { LoggerService } from '@app/logger';
interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}
@Injectable()
// @LogClass({
//   level: 'trace',
//   loggerClassField: 'logger',
//   active: () => process.env.NODE_ENV !== 'production',
// })
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    //@InjectCustomLoggerService() private readonly logger: CustomLoggerService,
    private readonly logger: LoggerService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.JWT_SECRET,
    });
    this.logger.setContext(JwtStrategy.name);
  }

  async validate(payload: JwtPayload) {
    return { userId: payload.userId };
  }
}
