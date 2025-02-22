import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { LoggerService } from '@app/logger';
import { UserResetPasswordEntity } from '../domain/user-reset-password.entity';
import { UserResetPasswordCreatedDto } from '../domain/types';

@Injectable()
export class UserResetPasswordRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UserResetPasswordRepository.name);
  }

  async create(createdDto: UserResetPasswordCreatedDto): Promise<void> {
    this.logger.debug(`Execute: create restore password`, this.create.name);
    await this.txHost.tx.userResetPasswordCode.create({
      data: {
        code: createdDto.code,
        expiredAt: createdDto.expiredAt,
        userId: createdDto.userId,
        createdAt: createdDto.createdAt,
      },
    });
  }
  async removeResetPasswordByCode(code: string): Promise<void> {
    this.logger.debug(
      `Execute: remove reset password by code: ${code}`,
      this.removeResetPasswordByCode.name,
    );
    await this.txHost.tx.userResetPasswordCode.delete({
      where: { code },
    });
  }

  async updateResetPasswordByCode(
    resetPassword: UserResetPasswordEntity,
    code: string,
  ): Promise<void> {
    this.logger.debug(
      `Execute: update reset password by code: ${code}`,
      this.updateResetPasswordByCode.name,
    );
    await this.txHost.tx.userResetPasswordCode.update({
      where: { code },
      data: {
        code: resetPassword.code,
        expiredAt: resetPassword.expiredAt,
      },
    });
  }

  async getResetPasswordByUserId(
    userId: string,
  ): Promise<UserResetPasswordEntity | null> {
    this.logger.debug(
      `Execute: get reset password by user id: ${userId}`,
      this.getResetPasswordByUserId.name,
    );
    const result = await this.txHost.tx.userResetPasswordCode.findUnique({
      where: { userId },
    });
    return result ? new UserResetPasswordEntity(result) : null;
  }
}
