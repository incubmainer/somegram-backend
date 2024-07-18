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
    email: string;
    confirmationToken: string;
  }) {
    const validToken = encodeURIComponent(dto.confirmationToken);
    await this.emailSender.sendHtml(
      dto.email,
      'Confirm your email',
      `
      <p>Click <a href="${this.frontendConfirmationUrl}?token=${validToken}">here</a> to confirm your email</p>
      code: ${dto.confirmationToken}
      `,
    );
  }
  public async sendRestorePasswordCode(dto: {
    email: string;
    restorePasswordCode: string;
  }) {
    await this.emailSender.sendHtml(
      dto.email,
      'Restore password',
      `
        <Click <a href="${this.frontendRestorePasswordUrl}?code=${dto.restorePasswordCode}">here</a> to restore your password</p>
        code: ${dto.restorePasswordCode}
      `,
    );
  }

  public async successRegistration(email: string) {
    await this.emailSender.sendHtml(
      email,
      'Registration success',
      `
        <p>Registration success</p>
      `,
    );
  }
}
