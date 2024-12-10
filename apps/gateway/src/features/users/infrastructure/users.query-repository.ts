import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as GatewayPrismaClient, User } from '@prisma/gateway';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';

import {
  MeOutputDto,
  userMapper,
} from '../../auth/api/dto/output-dto/me-output-dto';

@Injectable()
@LogClass({
  level: 'trace',
  loggerClassField: 'logger',
  active: () => process.env.NODE_ENV !== 'production',
})
export class UsersQueryRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    @InjectCustomLoggerService() private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext(UsersQueryRepository.name);
  }
  async getUserById(id?: string): Promise<User | null> {
    const user = await this.txHost.tx.user.findUnique({
      where: { id },
    });
    return user ? user : null;
  }

  async getInfoAboutMe(currentUserId: string): Promise<MeOutputDto | null> {
    const user = await this.txHost.tx.user.findFirst({
      where: { id: currentUserId },
    });
    if (!user) {
      return null;
    }
    return userMapper(user);
  }

  async getProfileInfo(userId: string): Promise<User | null> {
    const user = await this.txHost.tx.user.findFirst({
      where: { id: userId },
    });
    if (!user) {
      return null;
    }
    return user;
  }

  public async getUserByUsername(username: string): Promise<User | null> {
    const user = await this.txHost.tx.user.findFirst({
      where: {
        username,
      },
    });
    return user;
  }

  public async getTotalCountUsers() {
    return await this.txHost.tx.user.count();
  }
}
