import { Injectable } from '@nestjs/common';
import { createTransport, SendMailOptions, Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../settings/configuration/configuration';

@Injectable()
export class EmailSender {
  private transporter: Transporter;
  private emailSenderAddress: string;

  constructor(config: ConfigService<ConfigurationType, true>) {
    const envSettings = config.get('envSettings', { infer: true });
    this.emailSenderAddress = envSettings.EMAIL_USER;
    const transporter = createTransport({
      service: envSettings.EMAIL_SERVICE,
      auth: {
        user: envSettings.EMAIL_USER,
        pass: envSettings.EMAIL_PASSWORD,
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
