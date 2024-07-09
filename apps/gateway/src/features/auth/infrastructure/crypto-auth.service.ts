import crypto, { randomBytes, scrypt } from 'node:crypto';
import { CryptoAuthService as CryptoAuthServiceI } from '../domain/crypto-auth.service';
import { HashPassword } from '../domain/value-objects/hash-password';
import { Password } from '../domain/value-objects/password';
import { ConfirmationToken } from '../domain/value-objects/confirmation-token';

const SALT_LEN = 32;
const KEY_LEN = 64;

const SCRYPT_PARAMS = {
  N: 32768,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
};

export class CryptoAuthService implements CryptoAuthServiceI {
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
        const kv = p.split('=');
        // @ts-ignore
        kv[1] = Number(kv[1]);
        return kv;
      }),
    );
    const salt = Buffer.from(parsed[2], 'base64');
    const hash = Buffer.from(parsed[3], 'base64');
    return { params, salt, hash };
  }

  public hashPassword(password: Password): Promise<HashPassword> {
    return new Promise((resolve, reject) => {
      randomBytes(SALT_LEN, (err, salt) => {
        if (err) {
          reject(err);
          return;
        }
        scrypt(password.value, salt, KEY_LEN, SCRYPT_PARAMS, (err, hash) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(
            new HashPassword(this.serializeHash(hash, salt, SCRYPT_PARAMS)),
          );
        });
      });
    });
  }

  public generateConfirmationToken(): ConfirmationToken {
    return new ConfirmationToken(randomBytes(32).toString('base64'));
  }
  // const validatePassword = (password, hash = defaultHash) =>
  //   new Promise((resolve, reject) => {
  //     const parsedHash = deserializeHash(hash);
  //     const len = parsedHash.hash.length;
  //     crypto.scrypt(
  //       password,
  //       parsedHash.salt,
  //       len,
  //       parsedHash.params,
  //       (err, hashedPassword) => {
  //         if (err) {
  //           reject(err);
  //           return;
  //         }
  //         resolve(crypto.timingSafeEqual(hashedPassword, parsedHash.hash));
  //       },
  //     );
  //   });
}
