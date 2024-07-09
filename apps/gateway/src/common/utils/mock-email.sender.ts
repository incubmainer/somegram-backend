import { Injectable } from '@nestjs/common';

const sendLetterStr = (
  toEmail: string,
  subject: string,
  message: string,
): string =>
  `
toEmail: ${toEmail},
subject: ${subject},
message: ${message}
`;

const sendHtmlStr = (
  toEmail: string,
  subject: string,
  htmlCode: string,
): string =>
  `
toEmail: ${toEmail},
subject: ${subject},
htmlCode: ${htmlCode}
`;

@Injectable()
export class MockEmailSender {
  async sendLetter(
    toEmail: string,
    subject: string,
    message: string,
  ): Promise<void> {
    console.log(sendLetterStr(toEmail, subject, message));
  }

  async sendHtml(
    toEmail: string,
    subject: string,
    htmlCode: string,
  ): Promise<void> {
    console.log(sendHtmlStr(toEmail, subject, htmlCode));
  }
}
