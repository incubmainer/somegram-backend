import { SecurityDevices } from '@prisma/gateway';

export class SessionEntity implements SecurityDevices {
  userId: string;
  ip: string;
  deviceId: string;
  lastActiveDate: Date;
  title: string;

  constructor(dto: SecurityDevices) {
    this.userId = dto.userId;
    this.ip = dto.ip;
    this.deviceId = dto.deviceId;
    this.lastActiveDate = dto.lastActiveDate;
    this.title = dto.title;
  }
}
