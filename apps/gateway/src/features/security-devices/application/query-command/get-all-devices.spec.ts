import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { loadEnvFileNames } from '../../../../common/config/load-env-file-names';
import { finalConfig } from '../../../../common/config/config';
import { ClsTransactionalModule } from '../../../../common/modules/cls-transactional.module';
import { PrismaClient as GatewayPrismaClient, User } from '@prisma/gateway';
import {
  GetAllDevicesQueryCommand,
  GetAllDevicesQueryCommandHandler,
} from './get-all-devices.query';
import { SecurityDevicesModule } from '../../security-devices.module';
import { SecurityDevicesOutputDto } from '../../api/dto/output/security-devices.output-dto';
import { ApplicationNotificationModule } from '@app/application-notification';

type UserInsertType = {
  username: string;
  email: string;
  hashPassword: string;
  createdAt: Date;
  isConfirmed: boolean;
};

type DeviceInsertType = {
  userId: string;
  ip: string;
  deviceId: string;
  lastActiveDate: string;
  title: string;
};
describe('Get all security devices', () => {
  let queryBus: QueryBus;
  let txHost: TransactionHost<TransactionalAdapterPrisma<GatewayPrismaClient>>;
  let insertUserData: UserInsertType;
  let insertDeviceDto: DeviceInsertType;

  beforeAll(async () => {
    /*
    Просто зарегестрировать GatewayModule не получается, сыпяться ошибки
    из-за notification (НЕ Application-Notification)
    */
    const moduleBuilder: TestingModuleBuilder = Test.createTestingModule({
      imports: [
        ApplicationNotificationModule,
        SecurityDevicesModule,
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: false,
          envFilePath: loadEnvFileNames(),
          load: [finalConfig],
        }),
        ClsTransactionalModule,
      ],
    });

    const module: TestingModule = await moduleBuilder.compile();

    queryBus = module.get<QueryBus>(QueryBus);
    txHost = module.get<TransactionHost>(TransactionHost);
    /*
     Без регистрации обработчика не находит команду
    */
    queryBus.register([GetAllDevicesQueryCommandHandler]);
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

    insertDeviceDto = {
      userId: '',
      ip: '0.0.0.0',
      deviceId: '12345-12345',
      lastActiveDate: new Date().toISOString(),
      title: 'Mac os',
    };
  });

  const insertUser = async (insertDto: UserInsertType): Promise<User> => {
    return txHost.tx.user.create({ data: insertDto });
  };

  const insertDevices = async (insertDto: DeviceInsertType): Promise<void> => {
    await txHost.tx.securityDevices.create({
      data: insertDto,
    });
  };

  const clearTable = async (): Promise<void> => {
    await txHost.tx.user.deleteMany();
    await txHost.tx.securityDevices.deleteMany();
  };

  it('should get all devices', async () => {
    const user: User = await insertUser(insertUserData);
    const userId: string = user.id;
    await insertDevices({ ...insertDeviceDto, userId: userId });

    const devices: SecurityDevicesOutputDto[] = await queryBus.execute(
      new GetAllDevicesQueryCommand(userId),
    );

    expect(devices).toEqual([
      {
        deviceId: insertDeviceDto.deviceId,
        deviceName: insertDeviceDto.title,
        ip: insertDeviceDto.ip,
        lastVisit: insertDeviceDto.lastActiveDate,
      },
    ]);
  });

  it('should get all devices by user 1, 4 devices then get 1 device by user 2', async () => {
    const user: User = await insertUser(insertUserData);
    const userId: string = user.id;
    const device1User1: DeviceInsertType = {
      ...insertDeviceDto,
      userId: userId,
    };
    const device2User1: DeviceInsertType = {
      ...insertDeviceDto,
      userId: userId,
      ip: '123.22.22.0',
      deviceId: '00-00-00-22',
    };
    const device3User1: DeviceInsertType = {
      ...insertDeviceDto,
      userId: userId,
      ip: '0.22.22.0',
      deviceId: '00-11-00-22',
    };
    const device4User1: DeviceInsertType = {
      ...insertDeviceDto,
      userId: userId,
      ip: '1.22.22.0',
      deviceId: '00-22-00-22',
    };
    await insertDevices(device1User1);
    await insertDevices(device2User1);
    await insertDevices(device3User1);
    await insertDevices(device4User1);

    const user2: User = await insertUser({
      ...insertUserData,
      email: 'email22@mail.com',
      username: 'userName2',
    });
    const user2Id: string = user2.id;
    const deviceUser2: DeviceInsertType = {
      ...insertDeviceDto,
      userId: user2Id,
      ip: '66.22.22.0',
      deviceId: '22-22-00-22',
    };
    await insertDevices(deviceUser2);

    const getDevicesByUser1: SecurityDevicesOutputDto[] =
      await queryBus.execute(new GetAllDevicesQueryCommand(userId));
    expect(getDevicesByUser1).toEqual([
      {
        deviceId: device1User1.deviceId,
        deviceName: device1User1.title,
        ip: device1User1.ip,
        lastVisit: device1User1.lastActiveDate,
      },
      {
        deviceId: device2User1.deviceId,
        deviceName: device2User1.title,
        ip: device2User1.ip,
        lastVisit: device2User1.lastActiveDate,
      },
      {
        deviceId: device3User1.deviceId,
        deviceName: device3User1.title,
        ip: device3User1.ip,
        lastVisit: device3User1.lastActiveDate,
      },
      {
        deviceId: device4User1.deviceId,
        deviceName: device4User1.title,
        ip: device4User1.ip,
        lastVisit: device4User1.lastActiveDate,
      },
    ]);

    const getDevicesByUser2: SecurityDevicesOutputDto[] =
      await queryBus.execute(new GetAllDevicesQueryCommand(user2Id));
    expect(getDevicesByUser2).toEqual([
      {
        deviceId: deviceUser2.deviceId,
        deviceName: deviceUser2.title,
        ip: deviceUser2.ip,
        lastVisit: deviceUser2.lastActiveDate,
      },
    ]);
  });
});
