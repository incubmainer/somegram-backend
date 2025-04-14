import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { PaginatorService } from '@app/paginator';
import { ConfigService } from '@nestjs/config';

import { PaginatedUserModel } from '../../../../resolvers/users/models/paginated-user.model';
import { FollowerModel } from '../../../../resolvers/users/models/user.model';
import { QueryStringInput } from '../../../../resolvers/common/query-string-input.model';
import { ConfigurationType } from '../../../../../settings/configuration/configuration';
import { UsersFollowGraphqlRepository } from '../../../infrastructure/users-follow.graphql.repository';

export class GetUserFollowersQuery {
  constructor(
    public userId: string,
    public queryString: QueryStringInput,
  ) {}
}

@QueryHandler(GetUserFollowersQuery)
export class GetUserFollowersUseCase
  implements
    IQueryHandler<
      GetUserFollowersQuery,
      AppNotificationResultType<PaginatedUserModel>
    >
{
  private readonly frontProfileUrl: string;
  constructor(
    private usersFollowGraphqlRepository: UsersFollowGraphqlRepository,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly paginatorService: PaginatorService,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    this.logger.setContext(GetUserFollowersUseCase.name);
    const frontProvider = this.configService.get('envSettings', {
      infer: true,
    }).FRONTED_PROVIDER;
    this.frontProfileUrl = `${frontProvider}/public-user/profile`;
  }
  async execute(
    command: GetUserFollowersQuery,
  ): Promise<AppNotificationResultType<PaginatedUserModel>> {
    try {
      const { followersInfo, count } =
        await this.usersFollowGraphqlRepository.getFollowers(
          command.userId,
          command.queryString,
        );

      const data = this.paginatorService.create(
        command.queryString.pageNumber,
        command.queryString.pageSize,
        count,
        FollowerModel.mapFollowersInfo(followersInfo, this.frontProfileUrl),
      );

      return this.appNotification.success(data);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
