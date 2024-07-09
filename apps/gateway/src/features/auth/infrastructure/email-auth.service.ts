import { Injectable } from '@nestjs/common';
import { EmailSender } from 'apps/gateway/src/common/utils/email.sender';

@Injectable()
export class EmailAuthService {
  constructor(private readonly emailSender: EmailSender) { }
  public async sendConfirmationEmail(dto: {
    email: string;
    confirmationToken: string;
  }) {
    const validToken = encodeURIComponent(dto.confirmationToken);
    await this.emailSender.sendHtml(
      dto.email,
      'Confirm your email',
      `
<p>Click <a href="https://localhost:3000/auth/confirm-email?token=${validToken}">here</a> to confirm your email</p>
code: ${dto.confirmationToken}
`,
    );
  }
}
