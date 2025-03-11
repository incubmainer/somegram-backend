import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { PrismaClient as GatewayPrismaClient, User } from '@prisma/gateway';
import { GatewayModule } from '../../../../gateway.module';
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
import { FileDto } from '../../../posts/api/dto/input-dto/add-post.dto';
import {
  UploadAvatarCommand,
  UploadAvatarUseCase,
} from './upload-avatar.use-case';
import { Readable } from 'stream';

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

  async uploadAvatar(payload: {
    ownerId: string;
    file: FileDto;
  }): Promise<any> {
    return 'http://localhost:3001/avatar';
  }
}

const mockFile: Express.Multer.File = {
  fieldname: 'avatar',
  originalname: 'test-avatar.png',
  encoding: '7bit',
  mimetype: 'image/png',
  size: 1024,
  buffer: Buffer.from('test file content'),
  destination: '/tmp',
  filename: 'test-avatar.png',
  path: '/tmp/test-avatar.png',
  stream: Readable.from('test file content'), // Имитация потока данных
};

describe('Upload user avatar', () => {
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let txHost: TransactionHost<TransactionalAdapterPrisma<GatewayPrismaClient>>;
  let insertUserData: UserInsertType;
  let photoServiceAdapterMock: PhotoServiceAdapterMock;

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
    commandBus = module.get<CommandBus>(CommandBus);
    txHost = module.get<TransactionHost>(TransactionHost);
    queryBus.register([GetProfileInfoUseCase]);
    commandBus.register([UploadAvatarUseCase]);
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

  it('should upload user avatar', async () => {
    const user: User = await insertUser(insertUserData);
    const userId: string = user.id;

    const getUserProfileBeforeUploadAvatar: AppNotificationResultType<ProfileInfoOutputDto> =
      await queryBus.execute(new GetProfileInfoQuery(userId));
    expect(getUserProfileBeforeUploadAvatar.appResult).toBe(
      AppNotificationResultEnum.Success,
    );
    expect(getUserProfileBeforeUploadAvatar.errorField).toBeNull();
    expect(getUserProfileBeforeUploadAvatar.data).toEqual({
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

    const spy = jest
      .spyOn(photoServiceAdapterMock, 'getAvatar')
      .mockResolvedValue('http://localhost:3000/avatar/1');

    const result: AppNotificationResultType<string, string> =
      await commandBus.execute(new UploadAvatarCommand(userId, mockFile));
    expect(result.appResult).toBe(AppNotificationResultEnum.Success);
    expect(result.errorField).toBeNull();
    expect(result.data).toBeNull();

    const getUserProfileAfterUploadAvatar: AppNotificationResultType<ProfileInfoOutputDto> =
      await queryBus.execute(new GetProfileInfoQuery(userId));
    expect(getUserProfileAfterUploadAvatar.appResult).toBe(
      AppNotificationResultEnum.Success,
    );
    expect(getUserProfileAfterUploadAvatar.errorField).toBeNull();
    expect(getUserProfileAfterUploadAvatar.data).toEqual({
      email: insertUserData.email,
      userName: insertUserData.username,
      firstName: null,
      lastName: null,
      dateOfBirth: null,
      about: null,
      city: null,
      country: null,
      avatar: { url: expect.any(String) },
    });

    spy.mockRestore();
  });

  it('should not upload user avatar, user not found', async () => {
    const user: User = await insertUser(insertUserData);
    const userId: string = user.id;

    const getUserProfileBeforeUploadAvatar: AppNotificationResultType<ProfileInfoOutputDto> =
      await queryBus.execute(new GetProfileInfoQuery(userId));
    expect(getUserProfileBeforeUploadAvatar.appResult).toBe(
      AppNotificationResultEnum.Success,
    );
    expect(getUserProfileBeforeUploadAvatar.errorField).toBeNull();
    expect(getUserProfileBeforeUploadAvatar.data).toEqual({
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

    const spy = jest
      .spyOn(photoServiceAdapterMock, 'getAvatar')
      .mockResolvedValue(null);

    const result: AppNotificationResultType<string, string> =
      await commandBus.execute(
        new UploadAvatarCommand('userId-12344l-fr', mockFile),
      );
    expect(result.appResult).toBe(AppNotificationResultEnum.NotFound);
    expect(result.errorField).toBeNull();
    expect(result.data).toBeNull();

    const getUserProfileAfterUploadAvatar: AppNotificationResultType<ProfileInfoOutputDto> =
      await queryBus.execute(new GetProfileInfoQuery(userId));
    expect(getUserProfileAfterUploadAvatar.appResult).toBe(
      AppNotificationResultEnum.Success,
    );
    expect(getUserProfileAfterUploadAvatar.errorField).toBeNull();
    expect(getUserProfileAfterUploadAvatar.data).toEqual({
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

    spy.mockRestore();
  });

  it('should not upload avatar, some internal server error', async () => {
    const spy = jest
      .spyOn(photoServiceAdapterMock, 'uploadAvatar')
      .mockRejectedValue(new Error('Test error'));

    const user: User = await insertUser(insertUserData);
    const userId: string = user.id;

    const result: AppNotificationResultType<null> = await commandBus.execute(
      new UploadAvatarCommand(userId, mockFile),
    );
    expect(result.appResult).toBe(AppNotificationResultEnum.InternalError);
    expect(result.errorField).toBeNull();
    expect(result.data).toBeNull();

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
