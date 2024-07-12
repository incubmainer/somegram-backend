import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../../../common/config/constants/jwt-basic-constants';
interface JwtPayload {
  sub: string;
  login: string;
  iat?: number;
  exp?: number;
}

interface JwtRefreshTokenPayload {
  sub: string;
  deviceId: string;
  iat?: number;
  exp?: number;
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    return { id: payload.sub, login: payload.login };
  }
  async validateRefreshToken(payload: JwtRefreshTokenPayload) {
    return { id: payload.sub, deviceId: payload.deviceId };
  }
}
