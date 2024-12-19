import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../settings/configuration/configuration';

@Injectable()
export class RecapchaService {
  private readonly recapchaSecretKey: string;
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    const envSettings = this.configService.get('envSettings', { infer: true });
    this.recapchaSecretKey = envSettings.RECAPTCHA_SECRET_KEY;
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
