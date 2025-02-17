import { Injectable } from '@nestjs/common';
import { PaginatorService } from '@app/paginator';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';

import { UserModel } from '../../../resolvers/users/models/user.model';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { UsersRepository } from '../infrastructure/users.repository';
import { PaginatedUserModel } from '../../../resolvers/users/models/paginated-user.model';
import { AccountType } from '../../../../../../libs/common/enums/payments';
import { BanUserInput } from '../../../resolvers/users/models/ban-user-input';
import { UserWithBanInfo } from '../domain/user.interfaces';
import { QueryStringInput } from '../../../resolvers/users/models/pagination-users-input';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly paginatorService: PaginatorService,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
  ) {}
  async getUsers(
    queryString: QueryStringInput,
  ): Promise<AppNotificationResultType<PaginatedUserModel>> {
    try {
      const { users, count } =
        await this.usersQueryRepository.getUsers(queryString);

      const data = this.paginatorService.create(
        queryString.pageNumber,
        queryString.pageSize,
        count,
        this.mapUsers(users),
      );

      return this.appNotification.success(data);
    } catch (e) {
      this.logger.error(e, this.getUsers.name);
      return this.appNotification.internalServerError();
    }
  }

  async getUser(id: string): Promise<AppNotificationResultType<UserModel>> {
    try {
      const user = await this.usersQueryRepository.findUserById(id);
      if (!user) {
        this.appNotification.notFound();
      }
      return this.appNotification.success(this.mapUser(user));
    } catch (e) {
      this.logger.error(e, this.getUser.name);
      return this.appNotification.internalServerError();
    }
  }

  async gerUsersByIds(
    ids: string[],
  ): Promise<AppNotificationResultType<UserModel[]>> {
    try {
      const users = await this.usersQueryRepository.findUsersByIds(ids);
      return this.appNotification.success(this.mapUsers(users));
    } catch (e) {
      this.logger.error(e, this.gerUsersByIds.name);
      return this.appNotification.internalServerError();
    }
  }

  async removeUser(userId: string): Promise<AppNotificationResultType<null>> {
    try {
      const res = this.usersRepository.removeUser(userId);
      if (!res) return this.appNotification.notFound();
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.removeUser.name);
      return this.appNotification.internalServerError();
    }
  }

  async banUser(
    banUserInput: BanUserInput,
  ): Promise<AppNotificationResultType<null>> {
    try {
      const user = await this.usersQueryRepository.findUserById(
        banUserInput.userId,
      );
      if (!user) {
        return this.appNotification.notFound();
      }

      if (user.UserBanInfo) {
        return this.appNotification.success(null);
      }
      this.usersRepository.banUser(banUserInput.userId, banUserInput.banReason);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.banUser.name);
      return this.appNotification.internalServerError();
    }
  }

  async unbanUser(userId: string): Promise<AppNotificationResultType<null>> {
    try {
      const user = await this.usersQueryRepository.findUserById(userId);
      if (!user) {
        return this.appNotification.notFound();
      }
      if (!user.UserBanInfo) {
        return this.appNotification.success(null);
      }
      this.usersRepository.unbanUser(userId);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.unbanUser.name);
      return this.appNotification.internalServerError();
    }
  }

  private mapUsers(users: UserWithBanInfo[]): UserModel[] {
    return users.map((user) => {
      return this.mapUser(user);
    });
  }

  private mapUser(user: UserWithBanInfo): UserModel {
    return {
      id: user.id,
      username: user.username,
      accountType: user.accountType as AccountType,
      isDeleted: user.isDeleted,
      email: user.email,
      createdAt: user.createdAt,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      city: user.city,
      country: user.country,
      about: user.about,
      //использовать env FRONTED_PROVIDER
      profileLink: `https://somegram.online/ru/public-user/profile/${user.id}`,
      banInfo: user.UserBanInfo
        ? {
            banDate: user.UserBanInfo.banDate,
            banReason: user.UserBanInfo.banReason,
          }
        : null,
      //uploaded photos tab - все загруженные фотографии в публикациях пользователя
      //allPhotos: allPhotos ? [urls],
      //- все совершенные платежи пользователем
      //payments: payments
      //endDateOfSubscription: user.endDateOfSubscription,
      //autoRenewal: user.autoRenewal,
      //followers and following будет позже
    };
  }
}
