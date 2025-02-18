import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import {
  PrismaClient as GatewayPrismaClient,
  SecurityDevices,
} from '@prisma/gateway';
import { LoggerService } from '@app/logger';
import { SecurityDeviceCreateDto } from '../domain/types';

@Injectable()
export class SecurityDevicesRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SecurityDevicesRepository.name);
  }

  public async createSession(
    sessionCreatedDto: SecurityDeviceCreateDto,
  ): Promise<void> {
    await this.txHost.tx.securityDevices.create({
      data: {
        userId: sessionCreatedDto.userId,
        ip: sessionCreatedDto.ip,
        deviceId: sessionCreatedDto.deviceId,
        lastActiveDate: sessionCreatedDto.iat,
        title: sessionCreatedDto.userAgent,
      },
    });
  }

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

  public async deleteSessionsById(sessionsId: string[]): Promise<boolean> {
    try {
      await this.txHost.tx.securityDevices.deleteMany({
        where: { deviceId: { in: sessionsId } },
      });

      return true;
    } catch (e) {
      return false;
    }
  }

  public async deleteDevice(deviceId: string) {
    this.logger.debug(
      `Execute: delete device by deviceId ${deviceId}`,
      this.deleteDevice.name,
    );
    return await this.txHost.tx.securityDevices.delete({
      where: { deviceId: deviceId },
    });
  }

  async getDeviceById(deviceId: string): Promise<SecurityDevices | null> {
    this.logger.debug(
      `Execute: get device by deviceId ${deviceId}`,
      this.getDeviceById.name,
    );
    const device = await this.txHost.tx.securityDevices.findFirst({
      where: { deviceId },
    });
    if (!device) return null;
    return device;
  }

  public async getDevicesByUserId(
    userId: string,
  ): Promise<SecurityDevices[] | null> {
    const devices: SecurityDevices[] | [] =
      await this.txHost.tx.securityDevices.findMany({
        where: { userId: userId },
      });

    if (devices.length <= 0) return null;
    return devices;
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
