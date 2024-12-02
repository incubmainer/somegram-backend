import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { SecurityDevices } from '@prisma/gateway';

export class SecurityDevicesOutputDto {
  @ApiProperty({
    description: 'Device`s id',
    example: '1234-fk-s244',
    type: String,
  })
  deviceId: string;
  @ApiProperty({
    description: 'Name of the device from which you logged in',
    example: 'iPhone',
    type: String,
  })
  deviceName: string;
  @ApiProperty({
    description: 'IP address from which you logged in',
    example: '0.0.0.0',
    type: String,
  })
  ip: string;
  @ApiProperty({
    description: 'Last login date',
    example: '2024-10-18T12:00:00Z',
    type: String,
  })
  lastVisit: string;
}

// TODO
@Injectable()
export class SecurityDevicesOutputMapper {
  mapDevices(devices: SecurityDevices[]): SecurityDevicesOutputDto[] {
    return devices.map((device: SecurityDevices) => {
      return {
        deviceId: device.deviceId,
        deviceName: device.title,
        ip: device.ip,
        lastVisit: device.lastActiveDate,
      };
    });
  }
}
