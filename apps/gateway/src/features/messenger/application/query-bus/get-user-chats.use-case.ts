import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { Pagination } from '@app/paginator';
import { LoggerService } from '@app/logger';
import {
  GetUserChatsOutputDto,
  GetUserChatsOutputDtoMapper,
} from '../../api/dto/output-dto/get-user-chats.output.dto';
import { SearchQueryParametersWithoutSorting } from '../../../../common/domain/query.types';
import { MessengerServiceAdapter } from '../../../../common/adapter/messenger-service.adapter';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';

export class GetUserChatsQuery implements IQuery {
  constructor(
    public userId: string,
    public query: SearchQueryParametersWithoutSorting,
    public endCursorChatId: string | null,
  ) {}
}

@QueryHandler(GetUserChatsQuery)
export class GetUserChatsQueryUseCase
  implements
    IQueryHandler<
      GetUserChatsQuery,
      AppNotificationResultType<Pagination<GetUserChatsOutputDto[]>>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly messengerServiceAdapter: MessengerServiceAdapter,
    private readonly getUserChatsOutputDtoMapper: GetUserChatsOutputDtoMapper,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {
    this.logger.setContext(GetUserChatsQueryUseCase.name);
  }

  async execute(
    query: GetUserChatsQuery,
  ): Promise<AppNotificationResultType<Pagination<GetUserChatsOutputDto[]>>> {
    this.logger.debug('Execute: get user chats query', this.execute.name);
    const { userId, query: queryParams, endCursorChatId } = query;
    try {
      const resultChats = await this.messengerServiceAdapter.getUserChats(
        userId,
        queryParams,
        endCursorChatId,
      );

      if (resultChats.appResult !== AppNotificationResultEnum.Success)
        return resultChats as AppNotificationResultType<null>;

      const chats = { ...resultChats.data };
      const result: Pagination<GetUserChatsOutputDto[]> = {
        totalCount: chats.totalCount,
        pageNumber: chats.pageNumber,
        pageSize: chats.pageSize,
        pagesCount: chats.pagesCount,
        items: [],
      };

      if (chats?.items && chats?.items.length > 0) {
        const promises = chats.items.map(async (c) => {
          const [userResult, avatar] = await Promise.all([
            this.usersQueryRepository.getUserAndUserIsBan(c.participantId),
            this.photoServiceAdapter.getAvatar(c.participantId),
          ]);

          if (!userResult) return;

          const { user, isBan } = userResult;

          c.username = user.username;
          c.isBan = isBan;

          if (isBan) {
            c.avatarUrl = null;
          } else {
            c.avatarUrl = avatar?.url || null;
          }

          return this.getUserChatsOutputDtoMapper.mapChat(c);
        });

        const filteredResults = await Promise.all(promises);
        result.items.push(...filteredResults);
      }

      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
