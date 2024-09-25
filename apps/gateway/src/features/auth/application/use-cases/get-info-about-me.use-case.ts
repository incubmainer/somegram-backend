import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '../../../../../../../libs/custom-logger/src';
import { MeOutputDto } from '../../api/dto/output-dto/me-output-dto';
import { Notification } from '../../../../common/domain/notification';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';

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
    private usersQueryRepository: UsersQueryRepository,
    @InjectCustomLoggerService()
    private readonly logger: CustomLoggerService,
  ) {
    logger.setContext(GetInfoAboutMeUseCase.name);
  }
  async execute(
    command: GetInfoAboutMeCommand,
  ): Promise<Notification<MeOutputDto>> {
    const notification = new Notification<MeOutputDto>(MeCodes.Success);
    console.log(command.userId);
    try {
      const user = await this.usersQueryRepository.getInfoAboutMe(
        command.userId,
      );

      notification.setData(user);
    } catch (e) {
      this.logger.log('error', 'transaction error', { e });
      notification.setCode(MeCodes.TransactionError);
    }
    return notification;
  }
}
