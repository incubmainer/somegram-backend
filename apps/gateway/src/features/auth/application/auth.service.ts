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
  private readonly recaptchaSecretKey: string;
  private readonly recaptchaCheckUri: string =
    'https://www.google.com/recaptcha/api/siteverify';
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
    this.recaptchaSecretKey = envSettings.RECAPTCHA_SECRET_KEY;
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

  async verifyRecaptchaToken(token: string): Promise<boolean> {
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${this.recaptchaSecretKey}&response=${token}`,
    } as const;
    try {
      const response = await fetch(this.recaptchaCheckUri, payload);

      const data = await response.json();
      if (!data) return false;

      return data.success;
    } catch (e) {
      this.logger.error(
        `Recaptcha fetch error: ${e}`,
        this.verifyRecaptchaToken.name,
      );
      return false;
    }
  }

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
