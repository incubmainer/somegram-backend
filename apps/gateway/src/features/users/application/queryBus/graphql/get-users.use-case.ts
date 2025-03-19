import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { PaginatorService } from '@app/paginator';

import { UsersGraphqlRepository } from '../../../infrastructure/users.graphql-repository';
import { PaginatedUserModel } from '../../../../resolvers/users/models/paginated-user.model';
import { UserModel } from '../../../../resolvers/users/models/user.model';
import { UsersQueryStringInput } from '../../../../resolvers/users/models/users-query-string-input';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../../../settings/configuration/configuration';

export class GetUsersQuery {
  constructor(public queryString: UsersQueryStringInput) {}
}

@QueryHandler(GetUsersQuery)
export class GetUsersUseCase
  implements
    IQueryHandler<GetUsersQuery, AppNotificationResultType<PaginatedUserModel>>
{
  private readonly frontProfileUrl: string;
  constructor(
    private usersGraphqlRepository: UsersGraphqlRepository,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly paginatorService: PaginatorService,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    this.logger.setContext(GetUsersUseCase.name);
    const frontProvider = this.configService.get('envSettings', {
      infer: true,
    }).FRONTED_PROVIDER;
    this.frontProfileUrl = `${frontProvider}/public-user/profile`;
  }
  async execute(
    command: GetUsersQuery,
  ): Promise<AppNotificationResultType<PaginatedUserModel>> {
    try {
      const { users, count } = await this.usersGraphqlRepository.getUsers(
        command.queryString,
      );

      const data = this.paginatorService.create(
        command.queryString.pageNumber,
        command.queryString.pageSize,
        count,
        UserModel.mapUsers(users, this.frontProfileUrl),
      );

      return this.appNotification.success(data);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
