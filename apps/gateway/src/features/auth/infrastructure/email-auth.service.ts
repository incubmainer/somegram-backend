import { Injectable } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { EmailSender } from '../../../common/utils/email.sender';

@Injectable()
export class EmailAuthService {
  constructor(
    private readonly emailSender: EmailSender,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(EmailAuthService.name);
  }
  public async sendConfirmationEmail(dto: {
    name: string;
    email: string;
    confirmationToken: string;
    expiredAt: Date;
    html: string;
  }) {
    const encodedToken = encodeURIComponent(dto.confirmationToken);
    await this.emailSender.sendHtml(
      dto.email,
      'Confirm your email',
      dto.html
        .replaceAll('##name##', dto.name)
        .replaceAll('##token##', encodedToken)
        .replaceAll('##expiredAt##', dto.expiredAt.toISOString()),
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
