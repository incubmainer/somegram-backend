import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { Notification } from '@prisma/gateway';
import { GatewayModule } from '../../../../gateway.module';
import {
  GetNotificationsByUserIdQueryCommand,
  GetNotificationsByUserIdQueryCommandHandler,
} from './get-notifications.query.command';
import { NotificationOutputDto } from '../../api/dto/output-dto/notification.output.dto';
import { TransactionHost } from '@nestjs-cls/transactional';
import {
  GetNotificationByIdQueryCommand,
  GetNotificationByIdQueryCommandHandler,
} from './get-notification-by-id.query.command';

const userId = 'user-1';
const notificationId = 'notification-123';
const generateDto = () => {
  const data: Notification[] = [];
  for (let i = 0; i < 10; i++) {
    data.push({
      id: `notification-id-${i}`,
      userId: userId,
      message: 'Message message',
      isRead: true,
      createdAt: new Date(),
      updateAt: new Date(),
    });
  }
  return data;
};
const notificationData: Notification[] = generateDto();
const notificationMockData = {
  id: notificationId,
  userId: userId,
  message: 'Message message',
  isRead: true,
  createdAt: new Date(),
  updateAt: new Date(),
};

interface ITxHost {
  tx: {
    notification: {
      findMany: () => any;
      findUnique: () => any;
    };
  };
}

describe('Notification query', () => {
  let queryBus: QueryBus;
  let txHost: ITxHost;
  beforeAll(async () => {
    const moduleBuilder: TestingModuleBuilder = Test.createTestingModule({
      imports: [GatewayModule],
    });

    moduleBuilder.overrideProvider(TransactionHost).useValue({
      tx: {
        notification: {
          findMany: jest.fn().mockResolvedValue(notificationData),
          findUnique: jest.fn().mockResolvedValue(notificationMockData),
        },
      },
    });

    const module: TestingModule = await moduleBuilder.compile();

    queryBus = module.get<QueryBus>(QueryBus);
    queryBus.register([
      GetNotificationsByUserIdQueryCommandHandler,
      GetNotificationByIdQueryCommandHandler,
    ]);
    txHost = module.get<TransactionHost>(TransactionHost);
  });

  it('should get notifications by user id', async () => {
    const result: AppNotificationResultType<NotificationOutputDto[]> =
      await queryBus.execute(new GetNotificationsByUserIdQueryCommand(userId));

    expect(result.appResult).toEqual(AppNotificationResultEnum.Success);
    expect(result.data).toHaveLength(10);
    expect(result.data[0]).toEqual({
      id: expect.any(String),
      message: expect.any(String),
      isRead: expect.any(Boolean),
      createdAt: expect.any(Date),
    });
  });

  it('should get notifications by id', async () => {
    const result: AppNotificationResultType<NotificationOutputDto> =
      await queryBus.execute(
        new GetNotificationByIdQueryCommand(notificationId),
      );

    expect(result.appResult).toEqual(AppNotificationResultEnum.Success);
    expect(result.data).toEqual({
      id: notificationId,
      message: expect.any(String),
      isRead: expect.any(Boolean),
      createdAt: expect.any(Date),
    });
  });

  it('should not get notifications by id, not found', async () => {
    const getNotificationSpy = jest
      .spyOn(txHost.tx.notification, 'findUnique')
      .mockResolvedValueOnce(null);

    const result: AppNotificationResultType<NotificationOutputDto> =
      await queryBus.execute(
        new GetNotificationByIdQueryCommand(notificationId),
      );

    expect(result.appResult).toEqual(AppNotificationResultEnum.NotFound);
    expect(result.data).toBeNull();

    getNotificationSpy.mockRestore();
  });
});
