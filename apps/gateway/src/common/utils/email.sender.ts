import { Injectable } from '@nestjs/common';
import { createTransport, SendMailOptions, Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { EmailConfig } from '../../TRASH/common/config/configs/email.config';

@Injectable()
export class EmailSender {
  private transporter: Transporter;
  private emailSenderAddress: string;

  constructor(config: ConfigService) {
    const emailConfig = config.get<EmailConfig>('email');
    this.emailSenderAddress = emailConfig.user;
    const transporter = createTransport({
      service: emailConfig.service,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.password,
      },
    });
    this.transporter = transporter;
  }

  async sendLetter(
    toEmail: string,
    subject: string,
    message: string,
  ): Promise<void> {
    const mailOptions: SendMailOptions = {
      from: this.emailSenderAddress,
      to: toEmail,
      subject: subject,
      text: message,
    };
    await this.transporter.sendMail(mailOptions);
  }

  async sendHtml(
    toEmail: string,
    subject: string,
    htmlCode: string,
  ): Promise<void> {
    const mailOptions: SendMailOptions = {
      from: this.emailSenderAddress,
      to: toEmail,
      subject: subject,
      html: htmlCode,
    };
    await this.transporter.sendMail(mailOptions);
  }
}
