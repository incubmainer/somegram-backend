import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from '../config/configs/auth.config';

@Injectable()
export class RecapchaService {
  private readonly recapchaSecretKey: string;
  constructor(private readonly configService: ConfigService) {
    const authConfig = this.configService.get<AuthConfig>('auth');
    this.recapchaSecretKey = authConfig.recaptchaSecretKey;
  }
  async verifyRecaptchaToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://www.google.com/recaptcha/api/siteverify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `secret=${this.recapchaSecretKey}&response=${token}`,
        },
      );

      const data = await response.json();

      if (data.success) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}
