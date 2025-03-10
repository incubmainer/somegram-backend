import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

import { UsersGraphqlRepository } from '../../../infrastructure/users.graphql-repository';
import { UserModel } from '../../../../../resolvers/users/models/user.model';

export class GetUserQuery {
  constructor(public id: string) {}
}

@QueryHandler(GetUserQuery)
export class GetUserUseCase
  implements IQueryHandler<GetUserQuery, AppNotificationResultType<UserModel>>
{
  constructor(
    private usersGraphqlRepository: UsersGraphqlRepository,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(GetUserUseCase.name);
  }
  async execute(
    command: GetUserQuery,
  ): Promise<AppNotificationResultType<UserModel>> {
    const { id } = command;
    try {
      const user = await this.usersGraphqlRepository.findUserById(id);
      if (!user) {
        return this.appNotification.notFound();
      }
      return this.appNotification.success(UserModel.mapUser(user));
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
