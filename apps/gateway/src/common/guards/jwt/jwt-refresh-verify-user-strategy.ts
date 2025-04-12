import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersRepository } from '../../../features/users/infrastructure/users.repository';
import { Request } from 'express';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { ConfigService } from '@nestjs/config';
import { JWTRefreshTokenPayloadType } from '../../../features/auth/domain/types';

@Injectable()
export class JwtRefreshTokenVerifyUserStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token-verify-user',
) {
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly userRepository: UsersRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.refreshToken || null,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('envSettings', { infer: true }).JWT_SECRET,
    });
  }

  async validate(
    payload: JWTRefreshTokenPayloadType,
  ): Promise<JWTRefreshTokenPayloadType | null> {
    if (!payload) return null;

    const { userId } = payload;
    const user = await this.userRepository.getUserById(userId);
    if (!user) return null;
    if (user.userBanInfo) return null;

    return payload;
  }
}
