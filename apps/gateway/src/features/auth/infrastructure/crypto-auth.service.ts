import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from 'apps/gateway/src/common/config/configs/auth.config';
import { CryptoService } from 'apps/gateway/src/common/utils/crypto.service';

@Injectable()
export class CryptoAuthService {
  restorePasswordCodeLength: number;
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
  ) {
    const authConfig = this.configService.get<AuthConfig>('auth');
    this.restorePasswordCodeLength = authConfig.restorePasswordCodeLength;
  }
  public async hashPassword(password: string): Promise<string> {
    const hashPassword = await this.cryptoService.hash(password);
    return hashPassword;
  }

  public async generateConfirmationToken(): Promise<string> {
    const confirmationToken = this.cryptoService.generateRandomString(20);
    return confirmationToken;
  }

  public async generateRestorePasswordCode(): Promise<string> {
    const restorePasswordCode = this.cryptoService.generateRandomString(
      this.restorePasswordCodeLength,
    );
    return restorePasswordCode;
  }
}
