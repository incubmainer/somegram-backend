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

  public async deleteAllSessionsForUser(userId: string): Promise<void> {
    await this.txHost.tx.securityDevices.deleteMany({
      where: { userId: userId },
    });
  }

  public async deleteDevice(deviceId: string): Promise<boolean> {
    const result = await this.txHost.tx.securityDevices.delete({
      where: { deviceId: deviceId },
    });
    if (!result) return null;
    return true;
  }
  async getDiviceById(deviceId: string): Promise<SecurityDevices | null> {
    const device = await this.txHost.tx.securityDevices.findFirst({
      where: { deviceId },
    });
    if (!device) return null;
    return device;
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
