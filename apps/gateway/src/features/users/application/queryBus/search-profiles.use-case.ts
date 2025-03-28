import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { Pagination, PaginatorService } from '@app/paginator';

import {
  ProfilePublicInfoOutputDtoModel,
  userPublicProfileInfoMapper,
} from '../../api/dto/output-dto/profile-info-output-dto';
import { SearchQueryParametersWithoutSorting } from '../../../../common/domain/query.types';
import { UsersQueryRepository } from '../../infrastructure/users.query-repository';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';

export class SearchProfilesQuery {
  constructor(
    public userId: string,
    public queryString?: SearchQueryParametersWithoutSorting,
    public cursorUserId?: string,
  ) {}
}

@QueryHandler(SearchProfilesQuery)
export class SearchProfilesUseCase
  implements
    IQueryHandler<
      SearchProfilesQuery,
      AppNotificationResultType<Pagination<ProfilePublicInfoOutputDtoModel[]>>
    >
{
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly paginatorService: PaginatorService,
  ) {
    this.logger.setContext(SearchProfilesUseCase.name);
  }
  async execute(
    command: SearchProfilesQuery,
  ): Promise<
    AppNotificationResultType<Pagination<ProfilePublicInfoOutputDtoModel[]>>
  > {
    this.logger.debug(
      'Execute: search users by username command',
      this.execute.name,
    );
    const { userId, queryString, cursorUserId } = command;

    try {
      const { users, count } = await this.usersQueryRepository.searchUsers(
        userId,
        queryString,
        cursorUserId,
      );

      const avatars = await this.photoServiceAdapter.getUsersAvatar(
        users.map((user) => user.id),
      );

      const mappedUsers = users.map((user) =>
        userPublicProfileInfoMapper(
          user,
          avatars ? avatars.find((ava) => user.id === ava.ownerId) : null,
        ),
      );

      const result: Pagination<ProfilePublicInfoOutputDtoModel[]> =
        this.paginatorService.create(
          queryString.pageNumber,
          queryString.pageSize,
          count,
          mappedUsers,
        );

      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
