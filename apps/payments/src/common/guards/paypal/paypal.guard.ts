import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import * as crypto from 'crypto';
import * as crc32 from 'buffer-crc32';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import fetch from 'node-fetch';

@Injectable()
export class PayPalSignatureGuard implements CanActivate {
  private readonly WEBHOOK_ID: string;
  private readonly CACHE_DIR: string;

  constructor(private readonly configService: ConfigService) {
    this.WEBHOOK_ID = this.configService.get('PAYPAL_WEBHOOK_ID');
    this.CACHE_DIR = path.join(__dirname, '..', 'cache');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const data = context.switchToRpc().getData();
    const headers = data.payload.headers;
    const rawBody = data.payload.rawBody;
    const event = Buffer.from(rawBody.data);

    try {
      return await this.verifySignature(event, headers);
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  private async verifySignature(
    event: string | Buffer,
    headers: Record<string, string>,
  ): Promise<boolean> {
    const transmissionId = headers['paypal-transmission-id'];
    const timeStamp = headers['paypal-transmission-time'];
    const certUrl = headers['paypal-cert-url'];
    const signature = headers['paypal-transmission-sig'];

    if (!transmissionId || !timeStamp || !certUrl || !signature) {
      throw new Error(
        'Missing necessary header data for signature verification',
      );
    }

    const crc = parseInt('0x' + crc32(event).toString('hex'));

    const message = `${transmissionId}|${timeStamp}|${this.WEBHOOK_ID}|${crc}`; // Forming a signature

    const certPem = await this.downloadAndCache(certUrl); // We receive a public certificate to verify the signature

    const signatureBuffer = Buffer.from(signature, 'base64');

    //  Create an object to verify the signature
    const verifier = crypto.createVerify('SHA256');
    verifier.update(message);
    const res = verifier.verify(certPem, signatureBuffer);
    console.log(res);

    return res;
  }

  private async downloadAndCache(certUrl: string): Promise<string> {
    const cacheKey = certUrl.replace(/\W+/g, '-');
    const filePath = path.join(this.CACHE_DIR, cacheKey);

    try {
      await fs.mkdir(this.CACHE_DIR, { recursive: true });
    } catch (err) {
      console.error('Error creating cache directory', err);
    }

    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (err) {
      // Certificate not found in cache, downloading...
    }

    const response = await fetch(certUrl);
    const data = await response.text();
    await fs.writeFile(filePath, data);
    return data;
  }
}
