import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MeOutputDto } from '../../api/dto/output-dto/me-output-dto';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';
import { LoggerService } from '@app/logger';

export const MeCodes = {
  Success: Symbol('success'),
  TransactionError: Symbol('transactionError'),
};
export class GetInfoAboutMeCommand {
  constructor(public userId: string) {}
}

@CommandHandler(GetInfoAboutMeCommand)
// @LogClass({
//   level: 'trace',
//   loggerClassField: 'logger',
//   active: () => process.env.NODE_ENV !== 'production',
// })
export class GetInfoAboutMeUseCase
  implements ICommandHandler<GetInfoAboutMeCommand>
{
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    // @InjectCustomLoggerService()
    // private readonly logger: CustomLoggerService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetInfoAboutMeUseCase.name);
  }
  async execute(
    command: GetInfoAboutMeCommand,
    // @ts-ignore // TODO:
  ): Promise<NotificationObject<MeOutputDto>> {
    // @ts-ignore // TODO:
    const notification = new NotificationObject<MeOutputDto>(MeCodes.Success);
    try {
      const user = await this.usersQueryRepository.getInfoAboutMe(
        command.userId,
      );

      notification.setData(user);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      notification.setCode(MeCodes.TransactionError);
    }
    return notification;
  }
}
