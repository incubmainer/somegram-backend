import { ConfirmationToken } from './value-objects/confirmation-token';
import { HashPassword } from './value-objects/hash-password';
import { Password } from './value-objects/password';

export abstract class CryptoAuthService {
  public abstract hashPassword(password: Password): Promise<HashPassword>;
  public abstract generateConfirmationToken(): ConfirmationToken;
}
