import { Module } from '@nestjs/common';
import { DateFormatter } from './date-formater.service';

@Module({
  providers: [DateFormatter],
  exports: [DateFormatter],
})
export class DateFormaterModule {}
