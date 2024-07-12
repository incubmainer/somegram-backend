import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  PrismaClient as GatewayPrismaClient,
  User,
  UserConfirmationToken,
  UserResetPasswordCode,
} from '@prisma/gateway';

@Injectable()
export class UserRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
  ) {}
  public async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.txHost.tx.user.findFirst({
      where: {
        email,
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
}
