import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Socket } from 'socket.io';
import { jwtConstants } from '../../constants/jwt-basic-constants';
import { WsUnauthorizedException } from '../../exception-filter/ws/exceptions/ws-unauthorized.exception';
import { UsersRepository } from '../../../features/users/infrastructure/users.repository';
import { JWTAccessTokenPayloadType } from '../../domain/types/types';

@Injectable()
export class WsJwtStrategy extends PassportStrategy(Strategy, 'ws-jwt') {
  constructor(private readonly usersRepository: UsersRepository) {
    super({
      jwtFromRequest: (req) => {
        if (!req || !req.handshake || !req.handshake.headers)
          throw new WsUnauthorizedException();

        const authHeader = req.handshake.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer '))
          throw new WsUnauthorizedException();

        return authHeader.split(' ')[1];
      },
      ignoreExpiration: false,
      secretOrKey: jwtConstants.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(
    client: Socket,
    payload: JWTAccessTokenPayloadType,
  ): Promise<JWTAccessTokenPayloadType> {
    if (!payload || !payload.userId) throw new WsUnauthorizedException();

    const user = await this.usersRepository.getUserById(payload.userId);

    if (!user) throw new WsUnauthorizedException();

    return payload;
  }
}
