import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { LoggerService } from '@app/logger';
import { UserEntity } from '../domain/user.entity';
import {
  UserCreatedByGithubDto,
  UserCreatedByGoogleDto,
  UserCreatedDto,
  UserGitHubInfoCreatedDto,
  UserGoogleInfoCreatedDto,
} from '../domain/types';
import { UserGoogleAccount } from '../domain/user-google-account.entity';
import { UserConfirmationEntity } from '../../auth/domain/user-confirmation.entity';
import { UserResetPasswordEntity } from '../../auth/domain/user-reset-password.entity';
import { UserGithubAccountEntity } from '../domain/user-github-account.entity';

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

  public async getUserByEmail(email: string): Promise<UserEntity | null> {
    this.logger.debug(`Execute: get user by email`, this.getUserByEmail.name);
    const user = await this.txHost.tx.user.findFirst({
      where: {
        email,
      },
    });
    return user ? new UserEntity(user) : null;
  }

  public async getUserByUsername(username: string): Promise<UserEntity | null> {
    this.logger.debug(
      `Execute: get user by username`,
      this.getUserByUsername.name,
    );
    const user = await this.txHost.tx.user.findFirst({
      where: {
        username,
      },
    });
    return user ? new UserEntity(user) : null;
  }

  public async createNotConfirmedUser(
    createdDto: UserCreatedDto,
  ): Promise<UserEntity> {
    this.logger.debug(
      `Execute: save not confirmed user`,
      this.createNotConfirmedUser.name,
    );
    const user = await this.txHost.tx.user.create({
      data: {
        username: createdDto.username,
        email: createdDto.email,
        hashPassword: createdDto.hashPassword,
        createdAt: createdDto.createdAt,
        isConfirmed: createdDto.isConfirmed,
        confirmationToken: {
          create: {
            token: createdDto.confirmationToken,
            createdAt: createdDto.createdAt,
            expiredAt: createdDto.confirmationTokenExpiresAt,
          },
        },
      },
    });

    return new UserEntity(user);
  }

  public async createUserByGoogle(
    createdDto: UserCreatedByGoogleDto,
  ): Promise<UserEntity> {
    this.logger.debug(
      `Execute: save user by google`,
      this.createUserByGoogle.name,
    );
    const user = await this.txHost.tx.user.create({
      data: {
        username: createdDto.username,
        email: createdDto.email,
        createdAt: createdDto.createdAt,
        isConfirmed: createdDto.isConfirmed,
      },
    });

    return new UserEntity(user);
  }

  public async createUserByGithub(
    createdDto: UserCreatedByGithubDto,
  ): Promise<UserEntity> {
    this.logger.debug(
      `Execute: save user by github`,
      this.createUserByGithub.name,
    );

    const user = await this.txHost.tx.user.create({
      data: {
        username: createdDto.username,
        email: createdDto.email,
        createdAt: createdDto.createdAt,
        isConfirmed: createdDto.isConfirmed,
        firstName: createdDto.firstName,
      },
    });

    return new UserEntity(user);
  }

  public async updatePassword(user: UserEntity): Promise<void> {
    this.logger.debug(`Execute: update password`, this.updatePassword.name);
    await this.txHost.tx.user.update({
      data: {
        hashPassword: user.hashPassword,
      },
      where: { id: user.id },
    });
  }

  public async removeUserById(userId: string): Promise<void> {
    this.logger.debug(
      `Execute: remove user by id: ${userId}`,
      this.removeUserById.name,
    );

    await this.txHost.tx.user.delete({ where: { id: userId } });
  }

  public async getUserByEmailWithGoogleInfo(email: string): Promise<{
    user: UserEntity;
    googleInfo: UserGoogleAccount | null;
  } | null> {
    this.logger.debug(
      `Execute: get user by email with google info`,
      this.getUserByEmailWithGoogleInfo.name,
    );
    const result = await this.txHost.tx.user.findFirst({
      where: {
        email,
      },
      include: {
        googleInfo: true,
      },
    });

    if (!result) return null;

    const user = new UserEntity(result);

    if (!result.googleInfo) return { user, googleInfo: null };

    return { user, googleInfo: new UserGoogleAccount(result.googleInfo) };
  }

  public async addGoogleInfoToUser(
    createdGoogleInfoDto: UserGoogleInfoCreatedDto,
  ): Promise<void> {
    this.logger.debug(
      `Execute: save google info for user`,
      this.addGoogleInfoToUser.name,
    );
    await this.txHost.tx.userGoogleInfo.create({
      data: {
        userId: createdGoogleInfoDto.userId,
        sub: createdGoogleInfoDto.subGoogleId,
        email: createdGoogleInfoDto.googleEmail,
        emailVerified: createdGoogleInfoDto.googleEmailVerified,
      },
    });
  }

  public async addGithubInfoToUser(
    createdGithubInfoDto: UserGitHubInfoCreatedDto,
  ): Promise<void> {
    this.logger.debug(
      `Execute: save github info for user`,
      this.addGithubInfoToUser.name,
    );
    await this.txHost.tx.userGithubInfo.create({
      data: {
        userId: createdGithubInfoDto.userId,
        githubId: createdGithubInfoDto.githubId,
        email: createdGithubInfoDto.email,
        userName: createdGithubInfoDto.userName,
        displayName: createdGithubInfoDto.displayName,
      },
    });
  }

  public async confirmUser(userId: string): Promise<void> {
    this.logger.debug(
      `Execute: confirm user by user id`,
      this.confirmUser.name,
    );
    await this.txHost.tx.user.update({
      where: {
        id: userId,
      },
      data: {
        isConfirmed: true,
      },
    });
  }

  public async getUserByGoogleSub(sub: string): Promise<UserEntity | null> {
    this.logger.debug(
      `Execute: get user by google info`,
      this.getUserByGoogleSub.name,
    );
    const user = await this.txHost.tx.user.findFirst({
      where: {
        googleInfo: {
          sub: sub,
        },
      },
    });
    return user ? new UserEntity(user) : null;
  }

  public async getUserByToken(token: string): Promise<{
    user: UserEntity;
    confirmation: UserConfirmationEntity | null;
  } | null> {
    const result = await this.txHost.tx.user.findFirst({
      where: {
        confirmationToken: {
          token,
        },
      },
      include: {
        confirmationToken: true,
      },
    });

    if (!result) return null;

    const user = new UserEntity(result);
    let confirmation: UserConfirmationEntity | null = null;
    if (result.confirmationToken)
      confirmation = new UserConfirmationEntity(result.confirmationToken);

    return { user, confirmation };
  }

  public async getUserByResetPasswordCode(code: string): Promise<{
    user: UserEntity;
    resetPassword: UserResetPasswordEntity | null;
  } | null> {
    const result = await this.txHost.tx.user.findFirst({
      where: {
        resetPasswordCode: {
          code,
        },
      },
      include: {
        resetPasswordCode: true,
      },
    });

    if (!result) return null;

    const user = new UserEntity(result);
    let resetPassword: UserResetPasswordEntity | null = null;
    if (result.resetPasswordCode)
      resetPassword = new UserResetPasswordEntity(result.resetPasswordCode);

    return { user, resetPassword };
  }
  async getUserById(id: string): Promise<UserEntity | null> {
    this.logger.debug(`Execute: get user by id ${id}`, this.getUserById.name);
    const user = await this.txHost.tx.user.findUnique({
      where: { id },
    });
    return user ? new UserEntity(user) : null;
  }

  public async getUserByGithubId(githubId: string): Promise<UserEntity | null> {
    this.logger.debug(
      `Execute: get user by github id: ${githubId}`,
      this.getUserByGithubId.name,
    );
    const user = await this.txHost.tx.user.findFirst({
      where: {
        userGithubInfo: {
          githubId: githubId,
        },
      },
    });
    return user ? new UserEntity(user) : null;
  }

  public async getUserByEmailWithGithubInfo(email: string): Promise<{
    user: UserEntity;
    githubInfo: UserGithubAccountEntity | null;
  } | null> {
    this.logger.debug(
      `Execute: get user by email with github info: ${email}`,
      this.getUserByGithubId.name,
    );

    const result = await this.txHost.tx.user.findFirst({
      where: {
        email: email,
      },
      include: { userGithubInfo: true },
    });

    if (!result) return null;

    const user = new UserEntity(result);
    let githubInfo: UserGithubAccountEntity | null = null;
    if (result.userGithubInfo) githubInfo = result.userGithubInfo;

    return { user, githubInfo };
  }

  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////

  //
  // async getUsersById(id: string[]): Promise<User[] | null> {
  //   const users = await this.txHost.tx.user.findMany({
  //     where: { id: { in: id } },
  //   });
  //   return users && users.length > 0 ? users : null;
  // }
  //

  //
  // public async generateUniqueUsername(): Promise<string> {
  //   const result = await this.txHost.tx
  //     .$queryRaw`SELECT set_sequential_username() AS username`;
  //   return result[0].username;
  // }
  // public async addGoogleInfoToUserAndConfirm(
  //   userId: User['id'],
  //   googleInfo: {
  //     sub: string;
  //     name: string;
  //     email: string;
  //     email_verified: boolean;
  //   },
  // ) {
  //   await this.txHost.tx.userGoogleInfo.create({
  //     data: {
  //       userId,
  //       sub: googleInfo.sub,
  //       email: googleInfo.email,
  //       emailVerified: googleInfo.email_verified,
  //     },
  //   });
  //   await this.txHost.tx.user.update({
  //     where: { id: userId },
  //     data: { isConfirmed: true },
  //   });
  // }
  //
  // public async updateUserConfirmationInfo(dto: {
  //   userId: User['id'];
  //   createdAt: Date;
  //   confirmationToken: UserConfirmationToken['token'];
  //   confirmationTokenExpiresAt: UserConfirmationToken['expiredAt'];
  // }) {
  //   await this.txHost.tx.userConfirmationToken.update({
  //     where: { userId: dto.userId },
  //     data: {
  //       token: dto.confirmationToken,
  //       createdAt: dto.createdAt,
  //       expiredAt: dto.confirmationTokenExpiresAt,
  //     },
  //   });
  // }

  //
  // public deleteConfirmationToken(token: string) {
  //   return this.txHost.tx.userConfirmationToken.deleteMany({
  //     where: {
  //       token,
  //     },
  //   });
  // }
  //
  // public async updateRestorePasswordCode(dto: {
  //   userId: User['id'];
  //   restorePasswordCode: UserResetPasswordCode['code'];
  //   restorePasswordCodeCreatedAt: UserResetPasswordCode['createdAt'];
  //   restorePasswordCodeExpiresAt: UserResetPasswordCode['expiredAt'];
  // }) {
  //   await this.txHost.tx.userResetPasswordCode.deleteMany({
  //     where: {
  //       userId: dto.userId,
  //     },
  //   });
  //   return this.txHost.tx.user.update({
  //     where: {
  //       id: dto.userId,
  //     },
  //     data: {
  //       resetPasswordCode: {
  //         create: {
  //           code: dto.restorePasswordCode,
  //           createdAt: dto.restorePasswordCodeCreatedAt,
  //           expiredAt: dto.restorePasswordCodeExpiresAt,
  //         },
  //       },
  //     },
  //   });
  // }
  // public async getUserByRestorePasswordCode(code: string) {
  //   const user = await this.txHost.tx.user.findFirst({
  //     where: {
  //       resetPasswordCode: {
  //         code,
  //       },
  //     },
  //     include: {
  //       resetPasswordCode: true,
  //     },
  //   });
  //   return user;
  // }
  // public async deleteRestorePasswordCode(userId: User['id']) {
  //   return this.txHost.tx.userResetPasswordCode.deleteMany({
  //     where: {
  //       userId,
  //     },
  //   });
  // }
  // public async updateUserPassword(userId: User['id'], hashPassword: string) {
  //   return this.txHost.tx.user.update({
  //     where: {
  //       id: userId,
  //     },
  //     data: {
  //       hashPassword,
  //     },
  //   });
  // }
  //
  // public async createConfirmedUserWithGithub(
  //   user: UserFromGithub,
  //   { username, email, createdAt },
  // ) {
  //   const createdUser = await this.txHost.tx.user.create({
  //     data: {
  //       username: username,
  //       email: email,
  //       createdAt: createdAt,
  //       isConfirmed: true,
  //       userGithubInfo: {
  //         create: {
  //           githubId: user.githubId,
  //           userName: user.username,
  //           displayName: user.displayName,
  //           email: user.email,
  //         },
  //       },
  //     },
  //   });
  //   return createdUser;
  // }
  // public async addGithubInfo(
  //   user: UserFromGithub,
  //   userId: string,
  // ): Promise<UserGithubInfo> {
  //   return await this.txHost.tx.userGithubInfo.create({
  //     data: {
  //       userId: userId,
  //       githubId: user.githubId,
  //       userName: user.username,
  //       displayName: user.displayName,
  //       email: user.email,
  //     },
  //   });
  // }
  // public async changeGithubEmail(id: string, user: UserFromGithub) {
  //   return await this.txHost.tx.userGithubInfo.update({
  //     where: { userId: id, githubId: user.githubId },
  //     data: { email: user.email },
  //   });
  // }
  //
  // async updateUserProfileInfo(
  //   userId: User['id'],
  //   dto: {
  //     username: User['username'];
  //     firstName: User['firstName'];
  //     lastName: User['lastName'];
  //     dateOfBirth: User['dateOfBirth'];
  //     about: User['about'];
  //     updatedAt: User['updatedAt'];
  //     city: User['city'];
  //     country: User['country'];
  //     subscriptionExpireAt: User['subscriptionExpireAt'];
  //     accountType: User['accountType'];
  //   },
  // ): Promise<User> {
  //   return await this.txHost.tx.user.update({
  //     where: { id: userId },
  //     data: {
  //       username: dto.username,
  //       firstName: dto.firstName,
  //       lastName: dto.lastName,
  //       dateOfBirth: dto.dateOfBirth,
  //       about: dto.about,
  //       updatedAt: dto.updatedAt,
  //       city: dto.city,
  //       country: dto.country,
  //       subscriptionExpireAt: dto.subscriptionExpireAt,
  //       accountType: dto.accountType,
  //     },
  //   });
  // }
  //
  // async updateManyUsers(users: User[]): Promise<void> {
  //   await this.txHost.withTransaction(
  //     { timeout: this.TRANSACTION_TIMEOUT },
  //     async (): Promise<void> => {
  //       const promises = users.map((user: User) => {
  //         return this.txHost.tx.user.update({
  //           where: { id: user.id },
  //           data: user,
  //         });
  //       });
  //
  //       await Promise.all(promises);
  //     },
  //   );
  // }
}
