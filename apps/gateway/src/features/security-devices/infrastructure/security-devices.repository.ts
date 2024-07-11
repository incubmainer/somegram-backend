import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import {
  PrismaClient as GatewayPrismaClient,
  SecurityDevices,
} from '@prisma/gateway';
import { DeviceDto } from '../../auth/api/dto/input-dto/login-user-with-device.dto';
@Injectable()
export class SecurityDevicesRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
  ) {}

  public async addDevice(deviceDto: DeviceDto) {
    await this.txHost.tx.securityDevices.create({
      data: {
        userId: deviceDto.userId,
        ip: deviceDto.ip,
        deviceId: deviceDto.deviceId,
        lastActiveDate: deviceDto.lastActiveDate,
        title: deviceDto.title,
      },
    });
  }
}
