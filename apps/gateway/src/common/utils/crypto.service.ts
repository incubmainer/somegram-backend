import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { LoggerService } from '@app/logger';

const SALT_LEN = 32;
const KEY_LEN = 64;

// Only change these if you know what you're doing
const SCRYPT_PARAMS = {
  N: 32768,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
};

@Injectable()
export class CryptoService {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(CryptoService.name);
  }
  private serializeHash(hash: Buffer, salt: Buffer, params: any) {
    const paramString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join(',');
    const saltString = salt.toString('base64').split('=')[0];
    const hashString = hash.toString('base64').split('=')[0];
    return `$scrypt$${paramString}$${saltString}$${hashString}`;
  }

  private deserializeHash(phcString: string) {
    const parsed = phcString.split('$');
    parsed.shift();
    if (parsed[0] !== 'scrypt') {
      throw new Error('Node.js crypto module only supports scrypt');
    }
    const params = Object.fromEntries(
      parsed[1].split(',').map((p) => {
        const [key, value] = p.split('=');
        return [key, Number(value)] as [string, number];
      }),
    );
    const salt = Buffer.from(parsed[2], 'base64');
    const hash = Buffer.from(parsed[3], 'base64');
    return { params, salt, hash };
  }

  public hash(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      randomBytes(SALT_LEN, (err, salt) => {
        if (err) {
          reject(err);
          return;
        }
        scrypt(password, salt, KEY_LEN, SCRYPT_PARAMS, (err, hash) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.serializeHash(hash, salt, SCRYPT_PARAMS));
        });
      });
    });
  }

  public validatePassword(password: string, hash: string): Promise<boolean> {
    this.logger.debug(
      'Execute: validate password ',
      this.validatePassword.name,
    );
    return new Promise((resolve, reject) => {
      const parsedHash = this.deserializeHash(hash);
      const len = parsedHash.hash.length;
      scrypt(
        password,
        parsedHash.salt,
        len,
        parsedHash.params,
        (err, hashedPassword) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(timingSafeEqual(hashedPassword, parsedHash.hash));
        },
      );
    });
  }

  public generateRandomString(length: number): string {
    return randomBytes(length).toString('base64');
  }
}
