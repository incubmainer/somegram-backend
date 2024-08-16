import { Module } from '@nestjs/common';
import { EmailSender } from '../utils/email.sender';
import { MockEmailSender } from '../utils/mock-email.sender';

@Module({
  providers: [
    {
      provide: EmailSender,
      useClass:
        process.env.NODE_ENV === 'production' ? EmailSender : MockEmailSender,
    },
  ],
  exports: [EmailSender],
})
export class EmailModule {}
