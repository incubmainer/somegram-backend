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
} from './get-notification.query.command';
import { NotificationOutputDto } from '../../api/dto/output-dto/notification.output.dto';
import { TransactionHost } from '@nestjs-cls/transactional';

const userId = 'user-1';

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

describe('Notification query', () => {
  let queryBus: QueryBus;

  beforeAll(async () => {
    const moduleBuilder: TestingModuleBuilder = Test.createTestingModule({
      imports: [GatewayModule],
    });

    moduleBuilder.overrideProvider(TransactionHost).useValue({
      tx: {
        notification: {
          findMany: jest.fn().mockResolvedValue(notificationData),
        },
      },
    });

    const module: TestingModule = await moduleBuilder.compile();

    queryBus = module.get<QueryBus>(QueryBus);
    queryBus.register([GetNotificationsByUserIdQueryCommandHandler]);
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
});
