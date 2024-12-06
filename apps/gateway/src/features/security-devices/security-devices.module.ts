import { Module } from '@nestjs/common';
import { SecurityDevicesController } from './api/security-devices.controller';
import { SecurityDevicesOutputMapper } from './api/dto/output/security-devices.output-dto';
import { GetAllDevicesQueryCommandHandler } from './application/query-command/get-all-devices.query';
import { CqrsModule } from '@nestjs/cqrs';
import { TerminateDevicesExcludeCurrentCommandHandler } from './application/use-cases/terminate-devices-exclude-current.use-case';
import { TerminateDeviceByIdCommandHandler } from './application/use-cases/terminate-device-by-id.use-case';
import { SecurityDevicesRepository } from './infrastructure/security-devices.repository';

@Module({
  imports: [CqrsModule],
  controllers: [SecurityDevicesController],
  providers: [
    SecurityDevicesOutputMapper,
    GetAllDevicesQueryCommandHandler,
    TerminateDevicesExcludeCurrentCommandHandler,
    TerminateDeviceByIdCommandHandler,
    SecurityDevicesRepository,
  ],
  exports: [SecurityDevicesRepository],
})
export class SecurityDevicesModule {}
