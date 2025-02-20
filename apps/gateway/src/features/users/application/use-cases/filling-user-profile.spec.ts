import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { PrismaClient as GatewayPrismaClient, User } from '@prisma/gateway';
import { GatewayModule } from '../../../../gateway.module';
import { FillProfileInputDto } from '../../api/dto/input-dto/fill-profile.input-dto';
import {
  FillingUserProfileCommand,
  FillingUserProfileUseCase,
} from './filling-user-profile.use-case';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import {
  GetProfileInfoQuery,
  GetProfileInfoUseCase,
} from '../queryBus/get-profile-info.use-case';
import { ProfileInfoOutputDto } from '../../api/dto/output-dto/profile-info-output-dto';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { parseDateDDMMYYYY } from '../../../../common/utils/parse-date-dd-mm-yyyy';

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

describe('Filing user profile', () => {
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let txHost: TransactionHost<TransactionalAdapterPrisma<GatewayPrismaClient>>;
  let insertUserData: UserInsertType;
  let fillData: FillProfileInputDto;

  beforeAll(async () => {
    const moduleBuilder: TestingModuleBuilder = Test.createTestingModule({
      imports: [GatewayModule],
    })
      .overrideProvider(PhotoServiceAdapter)
      .useClass(PhotoServiceAdapterMock);

    const module: TestingModule = await moduleBuilder.compile();

    queryBus = module.get<QueryBus>(QueryBus);
    commandBus = module.get<CommandBus>(CommandBus);
    txHost = module.get<TransactionHost>(TransactionHost);
    queryBus.register([GetProfileInfoUseCase]);
    commandBus.register([FillingUserProfileUseCase]);
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

    fillData = {
      userName: 'NewUserName',
      firstName: 'Mikhail',
      lastName: 'Marchuk',
      dateOfBirth: '10.01.1999',
      about: 'This info about user',
      city: 'Vilnius',
      country: 'Lithuania',
    };
  });

  const insertUser = async (insertDto: UserInsertType): Promise<User> => {
    return txHost.tx.user.create({ data: insertDto });
  };

  const clearTable = async (): Promise<void> => {
    await txHost.tx.user.deleteMany();
    await txHost.tx.securityDevices.deleteMany();
  };

  it('should filing user profile', async () => {
    const user: User = await insertUser(insertUserData);
    const userId: string = user.id;

    const getUserProfileBeforeUpdate: AppNotificationResultType<ProfileInfoOutputDto> =
      await queryBus.execute(new GetProfileInfoQuery(userId));
    expect(getUserProfileBeforeUpdate.appResult).toBe(
      AppNotificationResultEnum.Success,
    );
    expect(getUserProfileBeforeUpdate.errorField).toBeNull();
    expect(getUserProfileBeforeUpdate.data).toEqual({
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

    const result: AppNotificationResultType<string, string> =
      await commandBus.execute(new FillingUserProfileCommand(userId, fillData));
    expect(result.appResult).toBe(AppNotificationResultEnum.Success);
    expect(result.errorField).toBeNull();
    expect(result.data).toBe(userId);

    const getUserProfileAfterUpdate: AppNotificationResultType<ProfileInfoOutputDto> =
      await queryBus.execute(new GetProfileInfoQuery(userId));
    expect(getUserProfileAfterUpdate.appResult).toBe(
      AppNotificationResultEnum.Success,
    );
    expect(getUserProfileAfterUpdate.errorField).toBeNull();
    expect(getUserProfileAfterUpdate.data).toEqual({
      email: insertUserData.email,
      userName: fillData.userName,
      firstName: fillData.firstName,
      lastName: fillData.lastName,
      dateOfBirth: parseDateDDMMYYYY(fillData.dateOfBirth).toISOString(),
      about: fillData.about,
      city: fillData.city,
      country: fillData.country,
      avatar: { url: null },
    });
  });

  it('should not filing user profile, user not found', async () => {
    const user: User = await insertUser(insertUserData);
    const userId: string = user.id;

    const result: AppNotificationResultType<string, string> =
      await commandBus.execute(
        new FillingUserProfileCommand('1924023-ddf-dd', fillData),
      );
    expect(result.appResult).toBe(AppNotificationResultEnum.NotFound);
    expect(result.data).toBeNull();
    expect(result.errorField).toBeNull();

    const getUserProfileAfterUpdate: AppNotificationResultType<ProfileInfoOutputDto> =
      await queryBus.execute(new GetProfileInfoQuery(userId));
    expect(getUserProfileAfterUpdate.appResult).toBe(
      AppNotificationResultEnum.Success,
    );
    expect(getUserProfileAfterUpdate.errorField).toBeNull();
    expect(getUserProfileAfterUpdate.data).toEqual({
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

  it('should not filing user profile, username already exist', async () => {
    await insertUser({
      ...insertUserData,
      email: 'other@emial.ru',
      username: 'NewUserName',
    });

    const user: User = await insertUser(insertUserData);
    const userId: string = user.id;

    const result: AppNotificationResultType<string, string> =
      await commandBus.execute(new FillingUserProfileCommand(userId, fillData));

    expect(result.appResult).toBe(AppNotificationResultEnum.BadRequest);
    expect(result.errorField).toEqual(expect.any(String));

    const getUserProfileAfterUpdate: AppNotificationResultType<ProfileInfoOutputDto> =
      await queryBus.execute(new GetProfileInfoQuery(userId));
    expect(getUserProfileAfterUpdate.appResult).toBe(
      AppNotificationResultEnum.Success,
    );
    expect(getUserProfileAfterUpdate.errorField).toBeNull();
    expect(getUserProfileAfterUpdate.data).toEqual({
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
});
