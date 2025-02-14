import { Injectable } from '@nestjs/common';
import { PaginatorService } from '@app/paginator';

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
  ) {}
  async getUsers(queryString: QueryStringInput): Promise<PaginatedUserModel> {
    const { users, count } =
      await this.usersQueryRepository.getUsers(queryString);

    return this.paginatorService.create(
      queryString.pageNumber,
      queryString.pageSize,
      count,
      this.mapUsers(users),
    );
  }

  async getUser(id: string): Promise<UserModel> {
    const user = await this.usersQueryRepository.findUserById(id);
    if (!user) {
      return null;
    }
    return this.mapUser(user);
  }

  async gerUsersByIds(ids: string[]): Promise<UserModel[]> {
    const users = await this.usersQueryRepository.findUsersByIds(ids);
    return this.mapUsers(users);
  }

  async removeUser(userId: string): Promise<boolean> {
    return this.usersRepository.removeUser(userId);
  }

  async banUser(banUserInput: BanUserInput): Promise<boolean> {
    const user = await this.usersQueryRepository.findUserById(
      banUserInput.userId,
    );
    if (!user) {
      return false;
    }
    return this.usersRepository.banUser(
      banUserInput.userId,
      banUserInput.banReason,
    );
  }

  async unbanUser(userId: string): Promise<boolean> {
    const user = await this.usersQueryRepository.findUserById(userId);
    if (!user) {
      return false;
    }
    return this.usersRepository.unbanUser(userId);
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
