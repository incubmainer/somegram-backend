import { Injectable } from '@nestjs/common';
import { PaginatorService } from '@app/paginator';

import { SearchQueryParametersType } from '../../../common/domain/query.types';
import { UserModel } from '../../../resolvers/users/models/user.model';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { UsersRepository } from '../infrastructure/users.repository';
import { PaginatedUserModel } from '../../../resolvers/users/models/paginated-user.model';
import { AccountType } from '../../../../../../libs/common/enums/payments';
import { BanUserInput } from '../../../resolvers/users/models/ban-user-input';
import { UserWithBanInfo } from '../domain/user.interfaces';
import { PhotoServiceAdapter } from '../../../common/adapter/photo-service.adapter';
import { FileModel } from '../../../resolvers/users/models/file-model';
import { QueryStringInput } from '../../../resolvers/users/models/pagination-users-input';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly paginatorService: PaginatorService,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
  ) {}
  async getUsers(queryString: QueryStringInput): Promise<PaginatedUserModel> {
    const { users, count } =
      await this.usersQueryRepository.getUsers(queryString);

    const userIds: string[] = users.map((user) => user.id);
    const avatars = await this.photoServiceAdapter.getUsersAvatar(userIds);
    return this.paginatorService.create(
      queryString.pageNumber,
      queryString.pageSize,
      count,
      this.mapUsers(users, avatars),
    );
  }

  async getUser(id: string): Promise<UserModel> {
    const user = await this.usersQueryRepository.findUserById(id);
    if (!user) {
      return null;
    }
    const avatar = await this.photoServiceAdapter.getAvatar(user.id);
    return this.mapUser(user, avatar);
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

  private mapUsers(
    users: UserWithBanInfo[],
    avatars?: FileModel[],
  ): UserModel[] {
    return users.map((user) => {
      const avatar = avatars
        ? avatars.find((avatar) => avatar.ownerId === user.id)
        : null;
      return this.mapUser(user, avatar);
    });
  }

  private mapUser(user: UserWithBanInfo, avatar?: FileModel): UserModel {
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
      avatar: avatar ? avatar : null,
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
