import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FrontendUrlsConfig } from 'apps/gateway/src/common/config/configs/frontend-urls';
import { EmailSender } from 'apps/gateway/src/common/utils/email.sender';

@Injectable()
export class EmailAuthService {
  frontedConfirmationUrl: string;
  constructor(
    private readonly emailSender: EmailSender,
    private readonly configService: ConfigService,
  ) {
    const config = this.configService.get<FrontendUrlsConfig>('frontendUrls');
    this.frontedConfirmationUrl = config.FRONTEND_REGISTRATION_CONFIRMATION_URL;
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
<p>Click <a href="${this.frontedConfirmationUrl}?token=${validToken}">here</a> to confirm your email</p>
code: ${dto.confirmationToken}
`,
    );
  }
}
