import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

import { UsersGraphqlRepository } from '../../../infrastructure/users.graphql-repository';
import { UserModel } from '../../../../resolvers/users/models/user.model';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../../../settings/configuration/configuration';

export class GetUsersByIdsQuery {
  constructor(public ids: string[]) {}
}

@QueryHandler(GetUsersByIdsQuery)
export class GetUsersByIdsUseCase
  implements
    IQueryHandler<GetUsersByIdsQuery, AppNotificationResultType<UserModel[]>>
{
  private readonly frontProfileUrl: string;
  constructor(
    private usersGraphqlRepository: UsersGraphqlRepository,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    this.logger.setContext(GetUsersByIdsUseCase.name);
    const frontProvider = this.configService.get('envSettings', {
      infer: true,
    }).FRONTED_PROVIDER;
    this.frontProfileUrl = `${frontProvider}/public-user/profile`;
  }
  async execute(
    command: GetUsersByIdsQuery,
  ): Promise<AppNotificationResultType<UserModel[]>> {
    const { ids } = command;
    try {
      const users = await this.usersGraphqlRepository.findUsersByIds(ids);
      return this.appNotification.success(
        UserModel.mapUsers(users, this.frontProfileUrl),
      );
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
