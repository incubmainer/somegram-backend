import { Injectable, UnauthorizedException } from '@nestjs/common';

import { UserRepository } from '../infrastructure/user.repository';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../../../common/utils/crypto.service';
import { jwtConstants } from '../../../common/config/constants/jwt-basic-constants';

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
      //if (!user || !user.isConfirmed) {
      return false;
    }

    const isValidPassword = await this.cryptoService.validatePassword(
      pass,
      user.hashPassword,
    );
    if (!isValidPassword) return null;

    return user.id;
  }

  async verifyRefreshToken(refreshToken: string) {
    const result = await this.jwtService.verify(refreshToken, {
      secret: jwtConstants.REFRESH_TOKEN_SECRET,
    });
    if (!result) {
      throw new UnauthorizedException();
    }
    return result;
  }
}
