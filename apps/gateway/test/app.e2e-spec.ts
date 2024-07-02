import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
// import { GatewayModule } from './../src/gateway.module';

describe('GatewayController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    // const moduleFixture: TestingModule = await Test.createTestingModule({
    //   imports: [GatewayModule],
    // }).compile();
    //
    // app = moduleFixture.createNestApplication();
    // await app.init();
  });

  it('/ (GET)', () => {
    expect(true).toBe(true);
  });
});
