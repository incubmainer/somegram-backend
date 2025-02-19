import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { LoggerService } from '@app/logger';
import { MailerService } from '@nestjs-modules/mailer';

interface IEmailAdapter {
  sendEmail(
    email: string,
    url: string,
    subject: string,
    template: string,
  ): Promise<void>;

  sendSubscriptionNotification(
    email: string,
    subject: string,
    template: string,
    date?: string,
  ): Promise<void>;
}

@Injectable()
export class EmailAdapter implements IEmailAdapter {
  private readonly sender: string;
  constructor(
    protected readonly logger: LoggerService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    this.logger.setContext(EmailAdapter.name);
    const envSettings = this.configService.get('envSettings', { infer: true });
    this.sender = envSettings.EMAIL_USER;
  }
  async sendEmail(
    email: string,
    url: string,
    subject: string,
    template: string,
  ): Promise<void> {
    await this.mailerService
      .sendMail({
        to: email,
        from: `Somegram <${this.sender}>`,
        subject: subject,
        template: template, // `.hbs` extension is appended automatically
        context: {
          name: email,
          url,
        },
      })
      .then((res) => {
        this.logger.debug(
          `Email response: ${JSON.stringify(res)}`,
          this.sendEmail.name,
        );
      })
      .catch((e) => {
        this.logger.error(e, this.sendEmail.name);
      });
  }

  async sendSubscriptionNotification(
    email: string,
    subject: string,
    template: string,
    date?: string,
  ): Promise<void> {
    await this.mailerService
      .sendMail({
        to: email,
        from: `Somegram <${this.sender}>`,
        subject: subject,
        template: template, // `.hbs` extension is appended automatically
        context: {
          name: email,
          date,
        },
      })
      .then((res) => {
        this.logger.debug(
          `Email response: ${JSON.stringify(res)}`,
          this.sendSubscriptionNotification.name,
        );
      })
      .catch((e) => {
        this.logger.error(e, this.sendSubscriptionNotification.name);
      });
  }

  async sendEmailWithHtmlPattern(
    email: string,
    subject: string,
    html: string,
  ): Promise<void> {
    await this.mailerService
      .sendMail({
        to: email,
        from: `Somegram <${this.sender}>`,
        subject: subject,
        html: html,
      })
      .then((res) => {
        this.logger.debug(
          `Email response: ${JSON.stringify(res)}`,
          this.sendEmailWithHtmlPattern.name,
        );
      })
      .catch((e) => {
        this.logger.error(e, this.sendEmailWithHtmlPattern.name);
      });
  }
}

@Injectable()
export class EmailAdapterMock extends EmailAdapter {
  async sendEmail(
    email: string,
    url: string,
    subject: string,
    template: string,
  ): Promise<void> {
    this.logger.log(
      `Send mock email. Email: ${email}, url: ${url}, subject: ${subject}, template: ${template}`,
      this.sendEmail.name,
    );
  }

  async sendSubscriptionNotification(
    email: string,
    subject: string,
    template: string,
    date?: string,
  ): Promise<void> {
    this.logger.log(
      `Send mock email. Email: ${email}, date: ${date}, subject: ${subject}, template: ${template}`,
      this.sendSubscriptionNotification.name,
    );
  }

  async sendEmailWithHtmlPattern(
    email: string,
    subject: string,
    html: string,
  ): Promise<void> {
    this.logger.log(
      `Send mock email. Email: ${email}, subject: ${subject}, html: ${html}`,
      this.sendEmailWithHtmlPattern.name,
    );
  }
}
