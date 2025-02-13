import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as GatewayPrismaClient, User } from '@prisma/gateway';
import {
  MeOutputDto,
  userMapper,
} from '../../auth/api/dto/output-dto/me-output-dto';
import { LoggerService } from '@app/logger';
import { SearchQueryParametersType } from '../../../common/domain/query.types';
import { UserWithBanInfo } from '../domain/user.interfaces';

@Injectable()
export class UsersQueryRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UsersQueryRepository.name);
  }
  async findUserById(id?: string): Promise<UserWithBanInfo | null> {
    this.logger.debug(`Find user by id: ${id}`, this.findUserById.name);

    const user = await this.txHost.tx.user.findFirst({
      where: { id },
      include: { UserBanInfo: true },
    });
    return user ? user : null;
  }

  async getInfoAboutMe(currentUserId: string): Promise<MeOutputDto | null> {
    this.logger.debug(
      `Find user by current user id: ${currentUserId}`,
      this.getInfoAboutMe.name,
    );

    const user = await this.txHost.tx.user.findFirst({
      where: { id: currentUserId },
    });
    if (!user) {
      return null;
    }
    return userMapper(user);
  }

  async getProfileInfo(userId: string): Promise<User | null> {
    this.logger.debug(
      `Find user by user id: ${userId}`,
      this.getProfileInfo.name,
    );

    return this.txHost.tx.user.findFirst({
      where: { id: userId },
    });
  }

  public async getUserByUsername(username: string): Promise<User | null> {
    this.logger.debug(
      `Find user by username: ${username}`,
      this.getUserByUsername.name,
    );

    return this.txHost.tx.user.findFirst({
      where: {
        username,
      },
    });
  }

  public async getTotalCountUsers(): Promise<number> {
    this.logger.debug(`Get total users count`, this.getTotalCountUsers.name);

    return this.txHost.tx.user.count();
  }

  public async getUsers(
    sanitizationQuery: SearchQueryParametersType,
  ): Promise<{ users: UserWithBanInfo[]; count: number }> {
    this.logger.debug(`Get all users `, this.getUsers.name);
    const skip =
      sanitizationQuery.pageSize * (sanitizationQuery.pageNumber - 1);
    let where = {};
    if (sanitizationQuery.search && sanitizationQuery.search.trim() !== '') {
      where = {
        username: {
          contains: sanitizationQuery.search,
          mode: 'insensitive',
        },
      };
    }

    where = {
      isDeleted: false,
    };

    const users = await this.txHost.tx.user.findMany({
      where,
      include: { UserBanInfo: true },
      orderBy: { [sanitizationQuery.sortBy]: sanitizationQuery.sortDirection },
      skip,
      take: sanitizationQuery.pageSize,
    });

    const count = await this.txHost.tx.user.count({
      where,
    });

    return {
      users,
      count,
    };
  }

  async findUsersByIds(ids: string[]) {
    this.logger.debug(`Get users by ids `, this.findUsersByIds.name);
    return await this.txHost.tx.user.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: { UserBanInfo: true },
    });
  }
}
