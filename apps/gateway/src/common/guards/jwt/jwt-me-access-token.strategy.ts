import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { UsersRepository } from '../../../features/users/infrastructure/users.repository';
import { MeOutputDto } from '../../../features/auth/api/dto/output-dto/me-output-dto';
import { LoggerService } from '@app/logger';
import { JWTAccessTokenPayloadType } from '../../../features/auth/domain/types';

@Injectable()
export class MeAccessTokenStrategy extends PassportStrategy(
  Strategy,
  'me-jwt-access-token',
) {
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly userRepository: UsersRepository,
    private readonly logger: LoggerService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('envSettings', { infer: true }).JWT_SECRET,
    });
    this.logger.setContext(MeAccessTokenStrategy.name);
  }

  async validate(
    payload: JWTAccessTokenPayloadType & { iat: number; exp: number },
  ): Promise<MeOutputDto | null> {
    this.logger.debug(
      'Execute: get info about current user',
      this.validate.name,
    );
    const { userId } = payload;
    const user = await this.userRepository.getUserById(userId);

    if (!user) return null;
    if (user.userBanInfo) return null;

    return new MeOutputDto(user);
  }
}
