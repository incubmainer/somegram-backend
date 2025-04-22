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
      include: { userBanInfo: true },
    });
    return user ? new UserEntity(user, user.userBanInfo) : null;
  }

  public async getUsersByIds(ids: string[]): Promise<UserEntity[] | null> {
    this.logger.debug(`Execute: get users by ids`, this.getUsersByIds.name);

    const users = await this.txHost.tx.user.findMany({
      where: {
        id: { in: ids },
      },
    });

    const userEntities = users.map((user) => new UserEntity(user));

    return userEntities.length > 0 ? userEntities : null;
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
        userBanInfo: true,
      },
    });

    if (!result) return null;

    const user = new UserEntity(result, result.userBanInfo);

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
      include: { userBanInfo: true },
    });
    return user ? new UserEntity(user, user.userBanInfo) : null;
  }

  public async getUserByToken(token: string): Promise<{
    user: UserEntity;
    confirmation: UserConfirmationEntity | null;
  } | null> {
    this.logger.debug(
      `Execute: get user by confirmation token`,
      this.getUserByToken.name,
    );

    const result = await this.txHost.tx.user.findFirst({
      where: {
        confirmationToken: {
          token,
        },
      },
      include: {
        confirmationToken: true,
        userBanInfo: true,
      },
    });

    if (!result) return null;

    const user = new UserEntity(result, result.userBanInfo);
    let confirmation: UserConfirmationEntity | null = null;
    if (result.confirmationToken)
      confirmation = new UserConfirmationEntity(result.confirmationToken);

    return { user, confirmation };
  }

  public async getUserByResetPasswordCode(code: string): Promise<{
    user: UserEntity;
    resetPassword: UserResetPasswordEntity | null;
  } | null> {
    this.logger.debug(
      `Execute: get user by reset password token`,
      this.getUserByResetPasswordCode.name,
    );
    const result = await this.txHost.tx.user.findFirst({
      where: {
        resetPasswordCode: {
          code,
        },
      },
      include: {
        resetPasswordCode: true,
        userBanInfo: true,
      },
    });

    if (!result) return null;

    const user = new UserEntity(result, result.userBanInfo);
    let resetPassword: UserResetPasswordEntity | null = null;
    if (result.resetPasswordCode)
      resetPassword = new UserResetPasswordEntity(result.resetPasswordCode);

    return { user, resetPassword };
  }
  async getUserById(id: string): Promise<UserEntity | null> {
    this.logger.debug(`Execute: get user by id ${id}`, this.getUserById.name);
    const user = await this.txHost.tx.user.findUnique({
      where: { id },
      include: { userBanInfo: true },
    });
    return user ? new UserEntity(user, user.userBanInfo) : null;
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
      include: { userBanInfo: true },
    });
    return user ? new UserEntity(user, user.userBanInfo) : null;
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
      include: { userGithubInfo: true, userBanInfo: true },
    });

    if (!result) return null;

    const user = new UserEntity(result, result.userBanInfo);
    let githubInfo: UserGithubAccountEntity | null = null;
    if (result.userGithubInfo) githubInfo = result.userGithubInfo;

    return { user, githubInfo };
  }

  async updateUserProfileInfo(user: UserEntity): Promise<void> {
    this.logger.debug(
      `Execute: update user profile`,
      this.updateUserProfileInfo.name,
    );
    await this.txHost.tx.user.update({
      where: { id: user.id },
      data: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        about: user.about,
        updatedAt: user.updatedAt,
        city: user.city,
        country: user.country,
        subscriptionExpireAt: user.subscriptionExpireAt,
        accountType: user.accountType,
      },
    });
  }

  async updateAccountType(user: UserEntity): Promise<void> {
    this.logger.debug(
      `Execute: update account type`,
      this.updateAccountType.name,
    );
    await this.txHost.tx.user.update({
      where: { id: user.id },
      data: {
        subscriptionExpireAt: user.subscriptionExpireAt,
        accountType: user.accountType,
      },
    });
  }
}
