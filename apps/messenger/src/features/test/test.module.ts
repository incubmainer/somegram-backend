import { Module } from '@nestjs/common';
import { TestController } from './test.controller';

@Module({
  providers: [],
  controllers: [TestController],
  exports: [],
  imports: [],
})
export class TestModule {}
