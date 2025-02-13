import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  PrismaClient as GatewayPrismaClient,
  User,
  UserGithubInfo,
  UserConfirmationToken,
  UserResetPasswordCode,
} from '@prisma/gateway';
import { UserFromGithub } from '../../auth/api/dto/input-dto/user-from-github';
import { LoggerService } from '@app/logger';

@Injectable()
export class UsersRepository {
  private readonly TRANSACTION_TIMEOUT: number = 50000;
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,

    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UsersRepository.name);
  }

  async getUserById(id: string): Promise<User | null> {
    this.logger.debug(`Execute: get user by id ${id}`, this.getUserById.name);
    const user = await this.txHost.tx.user.findUnique({
      where: { id },
    });
    return user ? user : null;
  }

  async getUsersById(id: string[]): Promise<User[] | null> {
    const users = await this.txHost.tx.user.findMany({
      where: { id: { in: id } },
    });
    return users && users.length > 0 ? users : null;
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    this.logger.debug(
      `Execute: get user by email ${email}`,
      this.getUserByEmail.name,
    );
    const user = await this.txHost.tx.user.findFirst({
      where: {
        email,
      },
    });
    return user;
  }

  public async getUserWithGithubInfo(
    email: string,
  ): Promise<(User & { userGithubInfo: UserGithubInfo | null }) | null> {
    const user = await this.txHost.tx.user.findFirst({
      where: {
        email: email,
      },
      include: { userGithubInfo: true },
    });
    return user;
  }

  public async generateUniqueUsername(): Promise<string> {
    const result = await this.txHost.tx
      .$queryRaw`SELECT set_sequential_username() AS username`;
    return result[0].username;
  }
  public async addGoogleInfoToUserAndConfirm(
    userId: User['id'],
    googleInfo: {
      sub: string;
      name: string;
      email: string;
      email_verified: boolean;
    },
  ) {
    await this.txHost.tx.userGoogleInfo.create({
      data: {
        userId,
        sub: googleInfo.sub,
        email: googleInfo.email,
        emailVerified: googleInfo.email_verified,
      },
    });
    await this.txHost.tx.user.update({
      where: { id: userId },
      data: { isConfirmed: true },
    });
  }
  public async getUserByEmailWithGoogleInfo(email: string) {
    const user = await this.txHost.tx.user.findFirst({
      where: {
        email,
      },
      include: {
        googleInfo: true,
      },
    });
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
  public async deleteUserById(id: User['id']): Promise<void> {
    await this.txHost.tx.user.delete({
      where: {
        id: id,
      },
    });
  }
  public async createNotConfirmedUser(dto: {
    username: User['username'];
    email: User['email'];
    hashPassword: User['hashPassword'];
    createdAt: Date;
    confirmationToken: UserConfirmationToken['token'];
    confirmationTokenExpiresAt: UserConfirmationToken['expiredAt'];
  }) {
    await this.txHost.tx.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        hashPassword: dto.hashPassword,
        createdAt: dto.createdAt,
        isConfirmed: false,
        confirmationToken: {
          create: {
            token: dto.confirmationToken,
            createdAt: dto.createdAt,
            expiredAt: dto.confirmationTokenExpiresAt,
          },
        },
      },
    });
  }

  public async updateUserConfirmationInfo(dto: {
    userId: User['id'];
    createdAt: Date;
    confirmationToken: UserConfirmationToken['token'];
    confirmationTokenExpiresAt: UserConfirmationToken['expiredAt'];
  }) {
    await this.txHost.tx.userConfirmationToken.update({
      where: { userId: dto.userId },
      data: {
        token: dto.confirmationToken,
        createdAt: dto.createdAt,
        expiredAt: dto.confirmationTokenExpiresAt,
      },
    });
  }
  public async findUserByToken(token: string) {
    const user = await this.txHost.tx.user.findFirst({
      where: {
        confirmationToken: {
          token,
        },
      },
      include: {
        confirmationToken: true,
      },
    });
    return user;
  }

  public deleteConfirmationToken(token: string) {
    return this.txHost.tx.userConfirmationToken.deleteMany({
      where: {
        token,
      },
    });
  }

  public confirmUser(id: User['id']) {
    return this.txHost.tx.user.update({
      where: {
        id,
      },
      data: {
        isConfirmed: true,
      },
    });
  }
  public async updateRestorePasswordCode(dto: {
    userId: User['id'];
    restorePasswordCode: UserResetPasswordCode['code'];
    restorePasswordCodeCreatedAt: UserResetPasswordCode['createdAt'];
    restorePasswordCodeExpiresAt: UserResetPasswordCode['expiredAt'];
  }) {
    await this.txHost.tx.userResetPasswordCode.deleteMany({
      where: {
        userId: dto.userId,
      },
    });
    return this.txHost.tx.user.update({
      where: {
        id: dto.userId,
      },
      data: {
        resetPasswordCode: {
          create: {
            code: dto.restorePasswordCode,
            createdAt: dto.restorePasswordCodeCreatedAt,
            expiredAt: dto.restorePasswordCodeExpiresAt,
          },
        },
      },
    });
  }
  public async getUserByRestorePasswordCode(code: string) {
    const user = await this.txHost.tx.user.findFirst({
      where: {
        resetPasswordCode: {
          code,
        },
      },
      include: {
        resetPasswordCode: true,
      },
    });
    return user;
  }
  public async deleteRestorePasswordCode(userId: User['id']) {
    return this.txHost.tx.userResetPasswordCode.deleteMany({
      where: {
        userId,
      },
    });
  }
  public async updateUserPassword(userId: User['id'], hashPassword: string) {
    return this.txHost.tx.user.update({
      where: {
        id: userId,
      },
      data: {
        hashPassword,
      },
    });
  }

  public async createConfirmedUserWithGithub(
    user: UserFromGithub,
    { username, email, createdAt },
  ) {
    const createdUser = await this.txHost.tx.user.create({
      data: {
        username: username,
        email: email,
        createdAt: createdAt,
        isConfirmed: true,
        userGithubInfo: {
          create: {
            githubId: user.githubId,
            userName: user.username,
            displayName: user.displayName,
            email: user.email,
          },
        },
      },
    });
    return createdUser;
  }
  public async addGithubInfo(
    user: UserFromGithub,
    userId: string,
  ): Promise<UserGithubInfo> {
    return await this.txHost.tx.userGithubInfo.create({
      data: {
        userId: userId,
        githubId: user.githubId,
        userName: user.username,
        displayName: user.displayName,
        email: user.email,
      },
    });
  }
  public async changeGithubEmail(id: string, user: UserFromGithub) {
    return await this.txHost.tx.userGithubInfo.update({
      where: { userId: id, githubId: user.githubId },
      data: { email: user.email },
    });
  }
  public async deleteAll() {
    await this.txHost.tx.userGithubInfo.deleteMany({});
    return await this.txHost.tx.user.deleteMany({});
  }
  public async getUserByGoogleSub(sub: string): Promise<User> {
    const user = await this.txHost.tx.user.findFirst({
      where: {
        googleInfo: {
          sub: sub,
        },
      },
    });
    return user;
  }
  public async createConfirmedUserWithGoogleInfo(dto: {
    username: string;
    email: string;
    createdAt: Date;
    googleInfo: {
      sub: string;
      name: string;
      email: string;
      email_verified: boolean;
    };
  }): Promise<User['id']> {
    const user = await this.txHost.tx.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        createdAt: dto.createdAt,
        isConfirmed: true,
        googleInfo: {
          create: {
            sub: dto.googleInfo.sub,
            email: dto.googleInfo.email,
            emailVerified: dto.googleInfo.email_verified,
          },
        },
      },
    });
    return user.id;
  }

  async updateUserProfileInfo(userId: User['id'], dto: User): Promise<User> {
    return await this.txHost.tx.user.update({
      where: { id: userId },
      data: {
        username: dto.username,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth: dto.dateOfBirth,
        about: dto.about,
        updatedAt: dto.updatedAt,
        city: dto.city,
        country: dto.country,
        accountType: dto.accountType,
      },
    });
  }

  async updateManyUsers(users: User[]): Promise<void> {
    await this.txHost.withTransaction(
      { timeout: this.TRANSACTION_TIMEOUT },
      async (): Promise<void> => {
        const promises = users.map((user: User) => {
          return this.txHost.tx.user.update({
            where: { id: user.id },
            data: user,
          });
        });

        await Promise.all(promises);
      },
    );
  }

  async removeUser(userId: string): Promise<boolean> {
    const res = await this.txHost.tx.user.update({
      where: { id: userId },
      data: { isDeleted: true },
    });
    if (!res) {
      return false;
    }
    return true;
  }

  async banUser(userId: string, reason: string): Promise<boolean> {
    await this.txHost.tx.userBanInfo.create({
      data: {
        userId: userId,
        banReason: reason,
        banDate: new Date(),
      },
    });

    return true;
  }

  async unbanUser(userId: string): Promise<boolean> {
    await this.txHost.tx.userBanInfo.delete({
      where: { userId: userId },
    });
    return true;
  }
}
