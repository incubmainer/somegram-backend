import { Injectable } from '@nestjs/common';

@Injectable()
export class MockRecapchaService {
  async verifyRecaptchaToken(token: string): Promise<boolean> {
    return !!token;
  }
}
