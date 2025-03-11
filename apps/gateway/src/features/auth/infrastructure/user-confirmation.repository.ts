import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { LoggerService } from '@app/logger';
import { UserConfirmationEntity } from '../domain/user-confirmation.entity';

@Injectable()
export class UserConfirmationRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UserConfirmationRepository.name);
  }

  async removeConfirmationByToken(token: string): Promise<void> {
    this.logger.debug(
      `Execute: remove confirmation by token: ${token}`,
      this.removeConfirmationByToken.name,
    );
    await this.txHost.tx.userConfirmationToken.delete({
      where: { token: token },
    });
  }

  async updateConfirmationByToken(
    confirmation: UserConfirmationEntity,
    token: string,
  ): Promise<void> {
    this.logger.debug(
      `Execute: update confirmation by token: ${token}`,
      this.updateConfirmationByToken.name,
    );
    await this.txHost.tx.userConfirmationToken.update({
      where: { token },
      data: {
        token: confirmation.token,
        expiredAt: confirmation.expiredAt,
      },
    });
  }
}
