import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SearchQueryParametersType } from '../../../common/domain/query.types';
import { UserModel } from '../../../resolvers/users/models/user.model';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { UsersRepository } from '../infrastructure/users.repository';
import { PaginatedUserModel } from '../../../resolvers/users/models/paginated-user.model';
import { User } from '@prisma/gateway';
import { AccountType } from '../../../../../../libs/common/enums/payments';
import { PaginatorService } from '@app/paginator';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly paginatorService: PaginatorService,
    private readonly configService: ConfigService,
  ) {}
  async getUsers(
    queryString: SearchQueryParametersType,
  ): Promise<PaginatedUserModel> {
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

  async removeUser(userId: string): Promise<boolean> {
    return this.usersRepository.removeUser(userId);
  }
  private mapUsers(users: User[]): UserModel[] {
    return users.map((user) => {
      return this.mapUser(user);
    });
  }
  private mapUser(user: User): UserModel {
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
      avatarURL: user.id,
      profileLink: `https://somegram.online/ru/public-user/profile/${user.id}`,
    };
  }
}
