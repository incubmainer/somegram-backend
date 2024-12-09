import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { finalConfig } from '../../../../common/config/config';
import { ClsTransactionalModule } from '../../../../common/modules/cls-transactional.module';
import { PrismaClient as GatewayPrismaClient, User } from '@prisma/gateway';
import { SecurityDevicesModule } from '../../security-devices.module';
import { SecurityDevicesOutputDto } from '../../api/dto/output/security-devices.output-dto';
import {
  GetAllDevicesQueryCommand,
  GetAllDevicesQueryCommandHandler,
} from '../query-command/get-all-devices.query';
import {
  TerminateDeviceByIdCommand,
  TerminateDeviceByIdCommandHandler,
} from './terminate-device-by-id.use-case';
import {
  TerminateDevicesExcludeCurrentCommand,
  TerminateDevicesExcludeCurrentCommandHandler,
} from './terminate-devices-exclude-current.use-case';
import {
  ApplicationNotificationModule,
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { loadEnv } from '../../../../settings/configuration/configuration';

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
describe('Terminate devices', () => {
  let commandBus: CommandBus;
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
        SecurityDevicesModule,
        ApplicationNotificationModule,
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: false,
          envFilePath: loadEnv(),
          load: [finalConfig],
        }),
        ClsTransactionalModule,
      ],
    });

    const module: TestingModule = await moduleBuilder.compile();

    queryBus = module.get<QueryBus>(QueryBus);
    commandBus = module.get<CommandBus>(CommandBus);
    txHost = module.get<TransactionHost>(TransactionHost);
    /*
     Без регистрации обработчика не находит команду
    */
    queryBus.register([GetAllDevicesQueryCommandHandler]);
    commandBus.register([
      TerminateDeviceByIdCommandHandler,
      TerminateDevicesExcludeCurrentCommandHandler,
    ]);
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
      userId: '1234f',
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

  describe('Terminate device by id', () => {
    it('should terminate device by id', async () => {
      const deviceIdToDellDto: string = '000-000';
      const user: User = await insertUser(insertUserData);
      const userId: string = user.id;
      await insertDevices({ ...insertDeviceDto, userId: userId });
      await insertDevices({
        ...insertDeviceDto,
        userId: userId,
        deviceId: deviceIdToDellDto,
        ip: '0.1.0.1',
        title: 'Android',
      });

      const res: AppNotificationResultType<void> = await commandBus.execute(
        new TerminateDeviceByIdCommand(userId, deviceIdToDellDto),
      );
      expect(res.appResult).toBe(AppNotificationResultEnum.Success);

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

    it('should not terminate device of user1 by id by user 2, forbidden', async () => {
      const deviceIdToDellDto: string = '000-000';
      const user: User = await insertUser(insertUserData);
      const userId: string = user.id;
      await insertDevices({ ...insertDeviceDto, userId: userId });
      await insertDevices({
        ...insertDeviceDto,
        userId: userId,
        deviceId: deviceIdToDellDto,
        ip: '0.1.0.1',
        title: 'Android',
      });

      const user2: User = await insertUser({
        ...insertUserData,
        email: 'other@mail.ru',
        username: 'other',
      });
      const user2Id: string = user2.id;

      const resultForbidden: AppNotificationResultType<void> =
        await commandBus.execute(
          new TerminateDeviceByIdCommand(user2Id, deviceIdToDellDto),
        );

      expect(resultForbidden.appResult).toBe(
        AppNotificationResultEnum.Forbidden,
      );

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
        {
          deviceId: deviceIdToDellDto,
          deviceName: 'Android',
          ip: '0.1.0.1',
          lastVisit: insertDeviceDto.lastActiveDate,
        },
      ]);

      const result: AppNotificationResultType<void> = await commandBus.execute(
        new TerminateDeviceByIdCommand(userId, deviceIdToDellDto),
      );

      expect(result.appResult).toBe(AppNotificationResultEnum.Success);

      const getDevices2: SecurityDevicesOutputDto[] = await queryBus.execute(
        new GetAllDevicesQueryCommand(userId),
      );

      expect(getDevices2).toEqual([
        {
          deviceId: insertDeviceDto.deviceId,
          deviceName: insertDeviceDto.title,
          ip: insertDeviceDto.ip,
          lastVisit: insertDeviceDto.lastActiveDate,
        },
      ]);
    });

    it('should not terminate device by id, device not found', async () => {
      const deviceIdToDellDto: string = '000-000';
      const user: User = await insertUser(insertUserData);
      const userId: string = user.id;
      await insertDevices({ ...insertDeviceDto, userId: userId });

      const result: AppNotificationResultType<void> = await commandBus.execute(
        new TerminateDeviceByIdCommand(userId, deviceIdToDellDto),
      );

      expect(result.appResult).toBe(AppNotificationResultEnum.NotFound);

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
  });

  describe('Terminate devices exclude current', () => {
    it('should terminate devices exclude current', async () => {
      const user: User = await insertUser(insertUserData);
      const userId: string = user.id;
      await insertDevices({ ...insertDeviceDto, userId: userId });
      await insertDevices({
        ...insertDeviceDto,
        userId: userId,
        deviceId: '0000-0000',
        ip: '0.1.0.1',
        title: 'Android',
      });

      const res: AppNotificationResultType<void> = await commandBus.execute(
        new TerminateDevicesExcludeCurrentCommand(
          userId,
          insertDeviceDto.deviceId,
        ),
      );
      expect(res.appResult).toBe(AppNotificationResultEnum.Success);

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

    it('should not terminate devices, other devices not found', async () => {
      const user: User = await insertUser(insertUserData);
      const userId: string = user.id;
      await insertDevices({ ...insertDeviceDto, userId: userId });

      const result: AppNotificationResultType<void> = await commandBus.execute(
        new TerminateDevicesExcludeCurrentCommand(
          userId,
          insertDeviceDto.deviceId,
        ),
      );
      expect(result.appResult).toBe(AppNotificationResultEnum.NotFound);

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
  });
});
