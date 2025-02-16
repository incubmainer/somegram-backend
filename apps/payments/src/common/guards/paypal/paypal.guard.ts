import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import * as crypto from 'crypto';
import * as crc32 from 'buffer-crc32';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import fetch from 'node-fetch';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { EnvSettings } from '../../../settings/env/env.settings';
import { LoggerService } from '@app/logger';
import { RpcForbiddenException } from '../../exception-filters/custom-exception/rpc-forbidden.exception';

@Injectable()
export class PayPalSignatureGuard implements CanActivate {
  private readonly WEBHOOK_ID: string;
  private readonly CACHE_DIR: string;
  private readonly envSettings: EnvSettings;

  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PayPalSignatureGuard.name);
    this.envSettings = this.configService.get('envSettings', { infer: true });
    this.WEBHOOK_ID = this.envSettings.PAYPAL_WEBHOOK_ID;
    this.CACHE_DIR = path.join(__dirname, '..', 'cache');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      this.logger.debug('Execute: PayPal Guard', this.canActivate.name);
      const data: {
        rawBody: { type: string; data: number[] };
        headers: { [key: string]: string };
      } = context.switchToRpc().getData();
      const headers = data.headers;
      const rawBody = data.rawBody;
      const event = Buffer.from(rawBody.data);
      return await this.verifySignature(event, headers);
    } catch (e) {
      this.logger.error(e, this.canActivate.name);
      throw new RpcForbiddenException('Forbidden');
    }
  }

  private async verifySignature(
    event: string | Buffer,
    headers: Record<string, string>,
  ): Promise<boolean> {
    const transmissionId: string = headers['paypal-transmission-id'];
    const timeStamp: string = headers['paypal-transmission-time'];
    const certUrl: string = headers['paypal-cert-url'];
    const signature: string = headers['paypal-transmission-sig'];

    if (!transmissionId || !timeStamp || !certUrl || !signature)
      throw new RpcForbiddenException('Forbidden');

    const crc: number = parseInt('0x' + crc32(event).toString('hex'));

    const message: string = `${transmissionId}|${timeStamp}|${this.WEBHOOK_ID}|${crc}`; // Forming a signature

    const certPem: string = await this.downloadAndCache(certUrl); // We receive a public certificate to verify the signature

    const signatureBuffer = Buffer.from(signature, 'base64');

    //  Create an object to verify the signature
    const verifier: crypto.Verify = crypto.createVerify('SHA256');
    verifier.update(message);
    const verify: boolean = verifier.verify(certPem, signatureBuffer);

    if (verify) {
      this.logger.debug('Verify successfully', this.verifySignature.name);
    } else {
      this.logger.debug('Verify error', this.verifySignature.name);
    }

    return verify;
  }

  private async downloadAndCache(certUrl: string): Promise<string> {
    const cacheKey: string = certUrl.replace(/\W+/g, '-');
    const filePath: string = path.join(this.CACHE_DIR, cacheKey);

    try {
      await fs.mkdir(this.CACHE_DIR, { recursive: true });
    } catch (e) {
      this.logger.error(e, this.downloadAndCache.name);
    }

    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (e) {
      // Certificate not found in cache, downloading...
    }

    const response = await fetch(certUrl);
    const data = await response.text();
    await fs.writeFile(filePath, data);
    return data;
  }
}
