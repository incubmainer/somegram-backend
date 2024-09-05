import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '../../../../../../../libs/custom-logger/src';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { TransactionHost } from '@nestjs-cls/transactional';
import { UserRepository } from '../../infrastructure/user.repository';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { MeOutputDto } from '../../api/dto/output-dto/me-output-dto';
import { Notification } from '../../../../common/domain/notification';

export const MeCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
};
export class GetInfoAboutMeCommand {
  constructor(public userId: string) {}
}

@CommandHandler(GetInfoAboutMeCommand)
@LogClass({
  level: 'trace',
  loggerClassField: 'logger',
  active: () => process.env.NODE_ENV !== 'production',
})
export class GetInfoAboutMeUseCase
  implements ICommandHandler<GetInfoAboutMeCommand>
{
  constructor(
    private userRepository: UserRepository,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    @InjectCustomLoggerService()
    private readonly logger: CustomLoggerService,
  ) {
    logger.setContext(GetInfoAboutMeUseCase.name);
  }
  async execute(
    command: GetInfoAboutMeCommand,
  ): Promise<Notification<MeOutputDto>> {
    const notification = new Notification<MeOutputDto>(MeCodes.Success);
    try {
      await this.txHost.withTransaction(async () => {
        const user = await this.userRepository.getInfoAboutMe(command.userId);
        notification.setData(user);
        return;
      });
    } catch (e) {
      if (notification.getCode() === MeCodes.Success) {
        notification.setCode(MeCodes.TransactionError);
      }
    }
    return notification;
  }
}
