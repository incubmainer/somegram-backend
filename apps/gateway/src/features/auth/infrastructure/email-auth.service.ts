import { Injectable } from '@nestjs/common';
import { EmailSender } from 'apps/gateway/src/common/utils/email.sender';

@Injectable()
export class EmailAuthService {
  constructor(private readonly emailSender: EmailSender) {}
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
        .replaceAll('##name##', dto.name)
        .replaceAll('##token##', dto.confirmationToken),
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
        .replaceAll('##name##', dto.name)
        .replaceAll('##code##', dto.restorePasswordCode),
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
