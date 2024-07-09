import { EmailSender } from 'apps/gateway/src/common/utils/email.sender';
import { EmailServiceI } from '../domain/email.service';
import { Email } from '../domain/value-objects/email';
import { ConfirmationToken } from '../domain/value-objects/confirmation-token';

export class EmailService implements EmailServiceI {
  constructor(private readonly emailSender: EmailSender) { }
  sendToEmailConfirmationLink(
    email: Email,
    confirmationToken: ConfirmationToken,
  ): void {
    this.emailSender.sendHtml(
      email.value,
      'confirm your email',
      `Click <a href="http://localhost:3000/confirm-email/${confirmationToken.value}">here</a> to confirm your email`,
    );
  }
}
