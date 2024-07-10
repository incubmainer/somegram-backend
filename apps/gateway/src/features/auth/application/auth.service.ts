import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants, tokensLivesConstants } from '../constants/constants';
import { UserRepository } from '../infrastructure/user.repository';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../../../common/utils/crypto.service';
import { PrismaClient as GatewayPrismaClient, User } from '@prisma/gateway';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userRepository: UserRepository,
    private cryptoService: CryptoService,
  ) {}
  async validateUser(email: string, pass: string) {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      return null;
    }

    const password = await this.cryptoService.validatePassword(
      pass,
      user?.hashPassword,
    );
    if (!password) {
      return null;
    }

    return user;
  }

  async login(user: User) {
    const payload = { userName: user.username, sub: user.id };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: jwtConstants.JWT_SECRET,
        expiresIn: tokensLivesConstants['1hour'],
      }),
    };
  }
  async createRefreshToken(user: User, deviceId: string) {
    const payload = { sub: user.id, deviceId: deviceId };
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
