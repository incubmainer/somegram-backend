import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import {
  PrismaClient as GatewayPrismaClient,
  SecurityDevices,
} from '@prisma/gateway';
@Injectable()
export class SecurityDevicesRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
  ) {}

  public async addDevice(
    userId: string,
    deviceId: string,
    ip: string,
    lastActiveDate: string,
    title: string,
  ) {
    await this.txHost.tx.securityDevices.create({
      data: {
        userId: userId,
        ip: ip,
        deviceId: deviceId,
        lastActiveDate: lastActiveDate,
        title: title,
      },
    });
  }

  public async isValidRefreshToken(
    lastActiveDate: string,
  ): Promise<SecurityDevices | null> {
    const result = await this.txHost.tx.securityDevices.findFirst({
      where: { lastActiveDate: lastActiveDate },
    });
    if (!result) return null;
    return result;
  }

  public async deleteRefreshTokenWhenLogout(
    deviceId: string,
  ): Promise<boolean> {
    const result = await this.txHost.tx.securityDevices.delete({
      where: { deviceId: deviceId },
    });
    if (!result) return null;
    return true;
  }
}
