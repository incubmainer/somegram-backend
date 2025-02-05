import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../../../common/utils/crypto.service';
import { jwtConstants } from '../../../common/constants/jwt-basic-constants';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { LoggerService } from '@app/logger';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AuthService.name);
  }
  async validateUser(email: string, pass: string) {
    const user = await this.usersRepository.getUserByEmail(email);
    if (!user || !user.isConfirmed) {
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
    this.logger.debug(
      'Execute: verify refresh token ',
      this.verifyRefreshToken.name,
    );
    const result = await this.jwtService.verify(refreshToken, {
      secret: jwtConstants.REFRESH_TOKEN_SECRET,
    });
    if (!result) {
      throw new UnauthorizedException();
    }
    return result;
  }
}
