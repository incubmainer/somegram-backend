import { Injectable } from '@nestjs/common';

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
    this.logger.debug('Execute: validate user ', this.validateUser.name);
    try {
      const user = await this.usersRepository.getUserByEmail(email);
      if (!user || !user.isConfirmed) {
        return null;
      }

      const isValidPassword = await this.cryptoService.validatePassword(
        pass,
        user.hashPassword,
      );
      if (!isValidPassword) return null;

      return user.id;
    } catch (e) {
      this.logger.error(e, this.validateUser.name);
    }
  }

  async verifyRefreshToken(refreshToken: string) {
    this.logger.debug(
      'Execute: verify refresh token ',
      this.verifyRefreshToken.name,
    );
    try {
      const result = await this.jwtService.verify(refreshToken, {
        secret: jwtConstants.REFRESH_TOKEN_SECRET,
      });
      if (!result) {
        return null;
      }
      return result;
    } catch (e) {
      this.logger.error(e, this.verifyRefreshToken.name);
    }
  }
}
