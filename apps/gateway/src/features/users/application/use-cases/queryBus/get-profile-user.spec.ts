import { QueryBus } from '@nestjs/cqrs';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { PrismaClient as GatewayPrismaClient, User } from '@prisma/gateway';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { PhotoServiceAdapter } from '../../../../../common/adapter/photo-service.adapter';
import {
  GetProfileInfoQuery,
  GetProfileInfoUseCase,
} from './get-profile-info.use-case';
import { ProfileInfoOutputDto } from '../../../api/dto/output-dto/profile-info-output-dto';
import { GatewayModule } from '../../../../../gateway.module';

type UserInsertType = {
  username: string;
  email: string;
  hashPassword: string;
  createdAt: Date;
  isConfirmed: boolean;
};

class PhotoServiceAdapterMock extends PhotoServiceAdapter {
  async getAvatar(userId: string): Promise<any> {
    return null;
  }
}

describe('Get user profile', () => {
  let queryBus: QueryBus;
  let txHost: TransactionHost<TransactionalAdapterPrisma<GatewayPrismaClient>>;
  let insertUserData: UserInsertType;
  let photoServiceAdapterMock: PhotoServiceAdapter;

  beforeAll(async () => {
    const moduleBuilder: TestingModuleBuilder = Test.createTestingModule({
      imports: [GatewayModule],
    })
      .overrideProvider(PhotoServiceAdapter)
      .useClass(PhotoServiceAdapterMock);

    const module: TestingModule = await moduleBuilder.compile();

    photoServiceAdapterMock =
      module.get<PhotoServiceAdapter>(PhotoServiceAdapter);
    queryBus = module.get<QueryBus>(QueryBus);
    txHost = module.get<TransactionHost>(TransactionHost);
    queryBus.register([GetProfileInfoUseCase]);
  });

  beforeEach(async () => {
    await clearTable();
    insertUserData = {
      username: 'User',
      email: 'email@mail.ru',
      hashPassword:
        '$scrypt$N=32768,r=8,p=1,maxmem=67108864$Is9DDL3Kyg8G25OIFmiPMMn7DHboeVoFa3zfuZqCBTA$K7oWNSUfwPa5YBXfOVnMQ95ZUIZqysXns9/bRq4e5gpxUMcRR2GHp+qVwYgTINEdMoYxwxpY52XnVuZcwMiWZA',
      createdAt: new Date(),
      isConfirmed: true,
    };
  });

  const insertUser = async (insertDto: UserInsertType): Promise<User> => {
    return txHost.tx.user.create({ data: insertDto });
  };

  const clearTable = async (): Promise<void> => {
    await txHost.tx.user.deleteMany();
    await txHost.tx.securityDevices.deleteMany();
  };

  it('should get user profile', async () => {
    const user: User = await insertUser(insertUserData);
    const userId: string = user.id;

    const result: AppNotificationResultType<ProfileInfoOutputDto> =
      await queryBus.execute(new GetProfileInfoQuery(userId));
    expect(result.appResult).toBe(AppNotificationResultEnum.Success);
    expect(result.errorField).toBeNull();
    expect(result.data).toEqual({
      email: insertUserData.email,
      userName: insertUserData.username,
      firstName: null,
      lastName: null,
      dateOfBirth: null,
      about: null,
      city: null,
      country: null,
      avatar: { url: null },
    });
  });

  it('should not get user profile, user not found', async () => {
    const result: AppNotificationResultType<ProfileInfoOutputDto> =
      await queryBus.execute(new GetProfileInfoQuery('userId'));
    expect(result.appResult).toBe(AppNotificationResultEnum.NotFound);
    expect(result.errorField).toBeNull();
    expect(result.data).toBeNull();
  });

  it('should not get user profile, some internal server error', async () => {
    const user: User = await insertUser(insertUserData);
    const userId: string = user.id;

    const spy = jest
      .spyOn(photoServiceAdapterMock, 'getAvatar')
      .mockRejectedValue(new Error('Test error'));

    const result: AppNotificationResultType<ProfileInfoOutputDto> =
      await queryBus.execute(new GetProfileInfoQuery(userId));
    expect(result.appResult).toBe(AppNotificationResultEnum.InternalError);
    expect(result.errorField).toBeNull();
    expect(result.data).toBeNull();

    spy.mockRestore();
  });
});
