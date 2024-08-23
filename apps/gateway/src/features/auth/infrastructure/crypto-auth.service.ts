import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from 'apps/gateway/src/common/config/configs/auth.config';
import { CryptoService } from 'apps/gateway/src/common/utils/crypto.service';

@LogClass({
  level: 'trace',
  loggerClassField: 'logger',
  active: () => process.env.NODE_ENV !== 'production',
})
@Injectable()
export class CryptoAuthService {
  restorePasswordCodeLength: number;
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
    @InjectCustomLoggerService() private readonly logger: CustomLoggerService,
  ) {
    logger.setContext(CryptoAuthService.name);
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
