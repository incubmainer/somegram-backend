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

  public async deleteAllSessionForUser(userId: string): Promise<void> {
    await this.txHost.tx.securityDevices.deleteMany({
      where: { userId: userId },
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
  async isValidRefreshTokenWithDeviceId(
    isOkLastactiveDate: string,
    deviceId1: string,
  ): Promise<SecurityDevices | null> {
    const isValidToken = await this.txHost.tx.securityDevices.findFirst({
      where: { lastActiveDate: isOkLastactiveDate, deviceId: deviceId1 },
    });
    if (!isValidToken) return null;
    return isValidToken;
  }

  async updateLastActiveDate(
    deviceId: string,
    lastActiveDate: string,
  ): Promise<boolean> {
    const result = await this.txHost.tx.securityDevices.update({
      where: { deviceId: deviceId },
      data: { lastActiveDate: lastActiveDate },
    });
    if (!result) return null;
    return true;
  }
}
