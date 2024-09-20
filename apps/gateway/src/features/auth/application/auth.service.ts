import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../../../common/utils/crypto.service';
import { jwtConstants } from '../../../common/config/constants/jwt-basic-constants';
import { UsersRepository } from '../../users/infrastructure/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}
  async validateUser(email: string, pass: string) {
    const user = await this.usersRepository.getUserByEmail(email);
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
