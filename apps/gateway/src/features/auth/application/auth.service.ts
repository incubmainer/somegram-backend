import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { LoggerService } from '@app/logger';
import {
  JWTAccessTokenPayloadType,
  JWTRefreshTokenPayloadType,
} from '../../../common/domain/types/types';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  private readonly saltRound: number;
  private readonly jwtSecret: string;
  private readonly jwtAccessExpiredTime: string;
  private readonly jwtRefreshExpiredTime: string;
  constructor(
    private jwtService: JwtService,
    private usersRepository: UsersRepository,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    this.logger.setContext(AuthService.name);
    const envSettings = this.configService.get('envSettings', { infer: true });
    this.saltRound = envSettings.SALT_ROUND;
    this.jwtSecret = envSettings.JWT_SECRET;
    this.jwtAccessExpiredTime = envSettings.JWT_ACCESS_EXPIRED_TIME;
    this.jwtRefreshExpiredTime = envSettings.JWT_REFRESH_EXPIRED_TIME;
  }

  async generateHash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRound);
  }

  async comparePass(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  generateUniqUserName(email: string): string {
    return email.split('@')[0] + '-' + randomUUID();
  }

  generateDeviceId(userId: string): string {
    return randomUUID().slice(0, 10) + '-' + userId;
  }

  async generateAccessToken(userId: string): Promise<string> {
    const payload = {
      userId: userId,
    } as JWTAccessTokenPayloadType;
    const options = {
      secret: this.jwtSecret,
      expiresIn: this.jwtAccessExpiredTime,
    };

    return await this.jwtService.signAsync(payload, options);
  }

  async generateRefreshToken(
    userId: string,
    deviceId: string,
  ): Promise<string> {
    const payload = {
      userId: userId,
      deviceId: deviceId,
    } as JWTRefreshTokenPayloadType;

    const options = {
      secret: this.jwtSecret,
      expiresIn: this.jwtRefreshExpiredTime,
    };

    return await this.jwtService.signAsync(payload, options);
  }

  // async validateUser(email: string, pass: string) {
  //   this.logger.debug('Execute: validate user ', this.validateUser.name);
  //   try {
  //     const user = await this.usersRepository.getUserByEmail(email);
  //     if (!user || !user.isConfirmed) {
  //       return null;
  //     }
  //     // @ts-ignore // TODO:
  //     const isValidPassword = await this.cryptoService.validatePassword(
  //       pass,
  //       user.hashPassword,
  //     );
  //     if (!isValidPassword) return null;
  //
  //     return user.id;
  //   } catch (e) {
  //     this.logger.error(e, this.validateUser.name);
  //   }
  // }

  async verifyRefreshToken(
    refreshToken: string,
  ): Promise<JWTRefreshTokenPayloadType> {
    this.logger.debug(
      'Execute: verify refresh token ',
      this.verifyRefreshToken.name,
    );
    try {
      return await this.jwtService.verify(refreshToken, {
        secret: this.jwtSecret,
      });
    } catch (e) {
      this.logger.error(e, this.verifyRefreshToken.name);
      return null;
    }
  }
}
