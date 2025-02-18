import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

import { UsersGraphqlRepository } from '../../../infrastructure/users.graphql-repository';
import { UserModel } from '../../../../../resolvers/users/models/user.model';

export class GetUsersByIdsQuery {
  constructor(public ids: string[]) {}
}

@QueryHandler(GetUsersByIdsQuery)
export class GetUsersByIdsUseCase
  implements
    IQueryHandler<GetUsersByIdsQuery, AppNotificationResultType<UserModel[]>>
{
  constructor(
    private usersGraphqlRepository: UsersGraphqlRepository,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(GetUsersByIdsUseCase.name);
  }
  async execute(
    command: GetUsersByIdsQuery,
  ): Promise<AppNotificationResultType<UserModel[]>> {
    const { ids } = command;
    try {
      const users = await this.usersGraphqlRepository.findUsersByIds(ids);
      return this.appNotification.success(UserModel.mapUsers(users));
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
