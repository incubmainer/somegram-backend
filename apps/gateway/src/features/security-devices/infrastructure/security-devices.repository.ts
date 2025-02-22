import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import {
  PrismaClient as GatewayPrismaClient,
  SecurityDevices,
} from '@prisma/gateway';
import { LoggerService } from '@app/logger';
import { SecurityDeviceCreateDto } from '../domain/types';
import { SessionEntity } from '../domain/session.entity';

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
    this.logger.debug(`Execute: create new session`, this.createSession.name);
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

  public async updateLastActiveDate(session: SessionEntity): Promise<void> {
    this.logger.debug(
      `Execute: update last active date`,
      this.updateLastActiveDate.name,
    );
    await this.txHost.tx.securityDevices.update({
      where: { deviceId: session.deviceId },
      data: { lastActiveDate: session.lastActiveDate },
    });
  }

  public async deleteAllSessionsForUser(userId: string): Promise<void> {
    this.logger.debug(
      `Execute: delete all session for user by user id: ${userId}`,
      this.deleteAllSessionsForUser.name,
    );
    await this.txHost.tx.securityDevices.deleteMany({
      where: { userId: userId },
    });
  }

  public async getDeviceById(deviceId: string): Promise<SessionEntity | null> {
    this.logger.debug(
      `Execute: get device by deviceId ${deviceId}`,
      this.getDeviceById.name,
    );
    const device = await this.txHost.tx.securityDevices.findFirst({
      where: { deviceId },
    });
    return device ? new SessionEntity(device) : null;
  }

  public async deleteDevice(deviceId: string): Promise<void> {
    this.logger.debug(
      `Execute: delete device by deviceId: ${deviceId}`,
      this.deleteDevice.name,
    );
    await this.txHost.tx.securityDevices.delete({
      where: { deviceId: deviceId },
    });
  }

  public async deleteSessionsById(sessionsId: string[]): Promise<void> {
    this.logger.debug(
      `Execute: delete sessions by id`,
      this.deleteSessionsById.name,
    );
    await this.txHost.tx.securityDevices.deleteMany({
      where: { deviceId: { in: sessionsId } },
    });
  }

  public async getDevicesByUserId(
    userId: string,
  ): Promise<SecurityDevices[] | null> {
    this.logger.debug(
      `Execute: get devices by userId: ${userId}`,
      this.getDevicesByUserId.name,
    );
    const devices: SecurityDevices[] | [] =
      await this.txHost.tx.securityDevices.findMany({
        where: { userId: userId },
      });

    if (devices.length <= 0) return null;
    return devices;
  }
}
