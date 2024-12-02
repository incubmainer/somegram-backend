import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  SecurityDevicesOutputDto,
  SecurityDevicesOutputMapper,
} from '../../api/dto/output/security-devices.output-dto';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  PrismaClient as GatewayPrismaClient,
  SecurityDevices,
} from '@prisma/gateway';

export class GetAllDevicesQueryCommand {
  constructor(public userId: string) {}
}

@QueryHandler(GetAllDevicesQueryCommand)
export class GetAllDevicesQueryCommandHandler
  implements
    IQueryHandler<GetAllDevicesQueryCommand, SecurityDevicesOutputDto[]>
{
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly securityDevicesOutputMapper: SecurityDevicesOutputMapper,
  ) {}

  async execute(
    query: GetAllDevicesQueryCommand,
  ): Promise<SecurityDevicesOutputDto[]> {
    const { userId } = query;

    const devices: SecurityDevices[] =
      await this.txHost.tx.securityDevices.findMany({
        where: { userId: userId },
      });

    return this.securityDevicesOutputMapper.mapDevices(devices);
  }
}
