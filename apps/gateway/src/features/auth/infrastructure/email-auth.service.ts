import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FrontendUrlsConfig } from 'apps/gateway/src/common/config/configs/frontend-urls';
import { EmailSender } from 'apps/gateway/src/common/utils/email.sender';

@Injectable()
export class EmailAuthService {
  frontendConfirmationUrl: string;
  frontendRestorePasswordUrl: string;
  constructor(
    private readonly emailSender: EmailSender,
    private readonly configService: ConfigService,
  ) {
    const config = this.configService.get<FrontendUrlsConfig>('frontendUrls');
    this.frontendConfirmationUrl =
      config.FRONTEND_REGISTRATION_CONFIRMATION_URL;
    this.frontendRestorePasswordUrl = config.FRONTEND_RESTORE_PASSWORD_URL;
  }
  public async sendConfirmationEmail(dto: {
    name: string;
    email: string;
    confirmationToken: string;
    html: string;
  }) {
    await this.emailSender.sendHtml(
      dto.email,
      'Confirm your email',
      dto.html
        .replace('##name##', dto.name)
        .replace('##token##', dto.confirmationToken),
    );
  }
  public async sendRestorePasswordCode(dto: {
    name: string;
    email: string;
    restorePasswordCode: string;
    html: string;
  }) {
    await this.emailSender.sendHtml(
      dto.email,
      'Restore password',
      dto.html
        .replace('##name##', dto.name)
        .replace('##code##', dto.restorePasswordCode),
    );
  }

  public async successRegistration(email: string) {
    await this.emailSender.sendHtml(
      email,
      'Registration success',
      `
        <p>Registration on somegram success</p>
      `,
    );
  }
}
