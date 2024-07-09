import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { GatewayModule } from './../src/gateway.module';
import * as request from 'supertest';

describe('GatewayController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GatewayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', async () => {
    const req = await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        email: 'some@mail.com',
        password: 'abcABC123+',
        username: 'SomeName',
      });
  });
});
