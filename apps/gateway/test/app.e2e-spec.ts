import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { GatewayModule } from './../src/gateway.module';
import * as request from 'supertest';
import { randomUUID } from 'crypto';

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
    const req = await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        email: 'some@mail.com',
        password: 'abcABC123+',
        username: 'SomeName',
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
    console.log('🚀 ~ it ~ rTokenUser01:', rTokenUser01);
    console.log('🚀 ~ it ~ aTokenUser01:', aTokenUser01);
  });
  it(`should return 401 when trying to log in user with incorrect password`, async () => {
    await request(app.getHttpServer())
      .post('auth/login')
      .send({
        email: 'some@mail.com',
        password: randomUUID(),
      })
      .expect(401);
  });
});
