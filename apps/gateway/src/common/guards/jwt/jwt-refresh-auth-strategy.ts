import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWTRefreshTokenPayloadType } from '../../domain/types/types';
import { UsersRepository } from '../../../features/users/infrastructure/users.repository';
import { User } from '@prisma/gateway';
import { Request } from 'express';
import { SecurityDevicesRepository } from '../../../features/security-devices/infrastructure/security-devices.repository';
import { SecurityDevices } from '@prisma/gateway';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshTokenStrategyStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly sessionRepositories: SecurityDevicesRepository,
    private readonly userRepository: UsersRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request?.cookies?.refreshToken;
          if (!token) {
            throw new UnauthorizedException();
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('envSettings', { infer: true }).JWT_SECRET,
    });
  }

  async validate(
    payload: JWTRefreshTokenPayloadType,
  ): Promise<JWTRefreshTokenPayloadType> {
    const { userId, iat, exp, deviceId } = payload;
    // @ts-ignore TODO:
    const user: User | null = await this.userRepository.getUserById(userId);

    if (!user) return null;

    const session: SecurityDevices | null =
      await this.sessionRepositories.getDeviceById(deviceId);
    if (!session) return null;
    if (
      session.lastActiveDate.toISOString() !==
      new Date(iat * 1000).toISOString()
    )
      return null;
    if (session.userId !== userId) return null;

    return {
      userId,
      deviceId,
      iat,
      exp,
    };
  }
}
