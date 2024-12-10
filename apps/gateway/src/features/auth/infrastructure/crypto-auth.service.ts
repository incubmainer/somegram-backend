import { Injectable } from '@nestjs/common';
import { CryptoService } from '../../../common/utils/crypto.service';

@Injectable()
export class CryptoAuthService {
  constructor(private readonly cryptoService: CryptoService) {}
  public async hashPassword(password: string): Promise<string> {
    const hashPassword = await this.cryptoService.hash(password);
    return hashPassword;
  }
}
