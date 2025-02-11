import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { NotificationRepository } from '../../infrastructure/notification.repository';
import {
  CreateNotificationUseCaseHandler,
  CreateNotificationUseCases,
} from './create-notification.use-cases';
import { Notification, User } from '@prisma/gateway';
import {
  MarkNotificationAsReadUseCaseHandler,
  MarkNotificationAsReadUseCases,
} from './mark-as-read.use-cases';
import { GatewayModule } from '../../../../gateway.module';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { AccountType } from '../../../../../../../libs/common/enums/payments';

const notification1Id = 'notification-1';
const userId = 'user-1';
const message = 'message for notification';

class NotificationRepoMock extends NotificationRepository {
  async create(newNotification: Notification): Promise<string> {
    return notification1Id;
  }

  async update(notification: Notification): Promise<void> {
    return;
  }

  async getNotificationById(
    notificationId: string,
  ): Promise<Notification | null> {
    return {
      id: notification1Id,
      message: message,
      userId: userId,
      isRead: false,
      updateAt: new Date(),
      createdAt: new Date(),
    };
  }
}

const userMockData = {
  id: userId,
  createdAt: new Date(),
  username: 'string',
  email: 'string',
  hashPassword: 'string',
  updatedAt: new Date(),
  isConfirmed: true,
  firstName: 'string',
  lastName: 'string',
  dateOfBirth: new Date(),
  subscriptionExpireAt: null,
  about: 'about',
  accountType: AccountType.Personal,
  city: 'City',
  country: 'country',
};

describe('Notification', () => {
  let commandBus: CommandBus;
  let notificationRepository: NotificationRepository;
  let userRepository: UsersRepository;
  beforeAll(async () => {
    const moduleBuilder: TestingModuleBuilder = Test.createTestingModule({
      imports: [GatewayModule],
    });

    moduleBuilder
      .overrideProvider(NotificationRepository)
      .useClass(NotificationRepoMock);

    moduleBuilder.overrideProvider(UsersRepository).useValue({
      getUserById: jest.fn().mockResolvedValue(userMockData),
    });

    const module: TestingModule = await moduleBuilder.compile();

    commandBus = module.get<CommandBus>(CommandBus);
    commandBus.register([
      CreateNotificationUseCaseHandler,
      MarkNotificationAsReadUseCaseHandler,
    ]);
    notificationRepository = module.get<NotificationRepository>(
      NotificationRepository,
    );
    userRepository = module.get<UsersRepository>(UsersRepository);
  });

  it('should create notification', async () => {
    const createSpy = jest.spyOn(notificationRepository, 'create');

    const result: AppNotificationResultType<null> = await commandBus.execute(
      new CreateNotificationUseCases(userId, message),
    );

    expect(createSpy).toHaveBeenCalledWith({
      userId: userId,
      message: message,
      isRead: false,
      createdAt: expect.any(Date),
    });

    expect(result.appResult).toEqual(AppNotificationResultEnum.Success);
    createSpy.mockRestore();
  });

  it('should not create notification, user not found', async () => {
    jest.clearAllMocks();
    const createSpy = jest.spyOn(notificationRepository, 'create');
    const userRepoSpy = jest.spyOn(userRepository, 'getUserById');

    userRepoSpy.mockResolvedValue(null);

    const result: AppNotificationResultType<null> = await commandBus.execute(
      new CreateNotificationUseCases(userId, message),
    );

    expect(createSpy).not.toHaveBeenCalled();

    expect(result.appResult).toEqual(AppNotificationResultEnum.NotFound);
    createSpy.mockRestore();
    userRepoSpy.mockRestore();
  });

  it('should mark notification as read', async () => {
    const updateSpy = jest.spyOn(notificationRepository, 'update');
    const getSpy = jest.spyOn(notificationRepository, 'getNotificationById');

    const result: AppNotificationResultType<null> = await commandBus.execute(
      new MarkNotificationAsReadUseCases(userId, notification1Id),
    );

    expect(getSpy).toHaveBeenCalledWith(notification1Id);
    expect(updateSpy).toHaveBeenCalledWith({
      id: notification1Id,
      userId: userId,
      message: message,
      isRead: true,
      createdAt: expect.any(Date),
      updateAt: expect.any(Date),
    });

    expect(result.appResult).toEqual(AppNotificationResultEnum.Success);
    updateSpy.mockRestore();
    getSpy.mockRestore();
  });

  it('should not mark notification as read, notification not found', async () => {
    const updateSpy = jest.spyOn(notificationRepository, 'update');
    const getSpy = jest.spyOn(notificationRepository, 'getNotificationById');

    getSpy.mockResolvedValueOnce(null);

    const result: AppNotificationResultType<null> = await commandBus.execute(
      new MarkNotificationAsReadUseCases(userId, notification1Id),
    );

    expect(getSpy).toHaveBeenCalledWith(notification1Id);
    expect(updateSpy).not.toHaveBeenCalled();

    expect(result.appResult).toEqual(AppNotificationResultEnum.NotFound);
    updateSpy.mockRestore();
    getSpy.mockRestore();
  });

  it('should not mark notification as read, forbidden', async () => {
    const updateSpy = jest.spyOn(notificationRepository, 'update');
    const getSpy = jest.spyOn(notificationRepository, 'getNotificationById');

    const result: AppNotificationResultType<null> = await commandBus.execute(
      new MarkNotificationAsReadUseCases('userId-2', notification1Id),
    );

    expect(getSpy).toHaveBeenCalledWith(notification1Id);
    expect(updateSpy).not.toHaveBeenCalled();

    expect(result.appResult).toEqual(AppNotificationResultEnum.Forbidden);
    updateSpy.mockRestore();
    getSpy.mockRestore();
  });

  it('should not mark notification as read, notification has already read', async () => {
    const updateSpy = jest.spyOn(notificationRepository, 'update');
    const getSpy = jest.spyOn(notificationRepository, 'getNotificationById');
    getSpy.mockResolvedValueOnce({
      id: notification1Id,
      message: message,
      userId: userId,
      isRead: true,
      updateAt: new Date(),
      createdAt: new Date(),
    });

    const result: AppNotificationResultType<null> = await commandBus.execute(
      new MarkNotificationAsReadUseCases(userId, notification1Id),
    );

    expect(getSpy).toHaveBeenCalledWith(notification1Id);
    expect(updateSpy).not.toHaveBeenCalled();

    expect(result.appResult).toEqual(AppNotificationResultEnum.Success);
    updateSpy.mockRestore();
    getSpy.mockRestore();
  });
});
