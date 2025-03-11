import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { UserCountOutputDto } from '../../api/dto/output-dto/profile-info-output-dto';
import { LoggerService } from '@app/logger';
import { UsersQueryRepository } from '../../infrastructure/users.query-repository';

export class GetTotalRegisteredUserQuery {
  constructor() {}
}

@QueryHandler(GetTotalRegisteredUserQuery)
export class GetTotalRegisteredUserQueryHandler
  implements
    IQueryHandler<
      GetTotalRegisteredUserQuery,
      AppNotificationResultType<UserCountOutputDto>
    >
{
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(GetTotalRegisteredUserQueryHandler.name);
  }
  async execute(
    command: GetTotalRegisteredUserQuery,
  ): Promise<AppNotificationResultType<UserCountOutputDto>> {
    this.logger.debug(
      'Execute: get registered total count user command',
      this.execute.name,
    );
    try {
      const count = await this.usersQueryRepository.getTotalCountUsers();

      return this.appNotification.success(new UserCountOutputDto(count));
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
