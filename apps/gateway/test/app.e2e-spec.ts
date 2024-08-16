import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { GatewayModule } from './../src/gateway.module';
import * as request from 'supertest';

describe('GatewayController (e2e)', () => {
  let app: INestApplication;

  let aTokenUser01;
  let rTokenUser01;

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
    await request(app.getHttpServer()).post('/auth/registration').send({
      email: 'some@mail.com',
      password: 'abcABC123+',
      username: 'SomeName',
      html: 'some html',
    });
  });

  it('should Log in user ', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'some@mail.com',
        password: 'abcABC123+',
      })
      .expect(200);
    aTokenUser01 = response.body.accessToken;
    rTokenUser01 = response.headers['set-cookie'][0];

    expect(aTokenUser01).toBeDefined();
    expect(rTokenUser01).toContain('refreshToken=');
  });
});
