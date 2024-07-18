import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../infrastructure/user.repository';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../../../common/utils/crypto.service';
import {
  jwtConstants,
  tokensLivesConstants,
} from '../../../common/config/constants/jwt-basic-constants';
import { UserFromGithub } from '../api/dto/input-dto/user-from-github';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userRepository: UserRepository,
    private cryptoService: CryptoService,
  ) {}
  async validateUser(email: string, pass: string) {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) return null;

    const isValidPassword = await this.cryptoService.validatePassword(
      pass,
      user.hashPassword,
    );
    if (!isValidPassword) return null;

    return user;
  }

  async login(userId: string) {
    const payload = { sub: userId };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: jwtConstants.JWT_SECRET,
        expiresIn: tokensLivesConstants['1hour'],
      }),
    };
  }
  async createRefreshToken(userId: string, deviceId: string) {
    const payload = { sub: userId, deviceId: deviceId };
    return await this.jwtService.signAsync(payload, {
      secret: jwtConstants.REFRESH_TOKEN_SECRET,
      expiresIn: tokensLivesConstants['2hours'],
    });
  }

  async verifyRefreshToken(refreshToken: string) {
    try {
      const result = await this.jwtService.verify(refreshToken, {
        secret: jwtConstants.REFRESH_TOKEN_SECRET,
      });
      if (!result) {
        throw new UnauthorizedException();
      }

      return result;
    } catch (e) {
      console.log({ verify_error: e });
    }
  }
}
