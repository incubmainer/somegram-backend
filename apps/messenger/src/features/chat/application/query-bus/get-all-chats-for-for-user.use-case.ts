import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { Pagination, PaginatorService } from '@app/paginator';
import {
  GetAllUserChatsOutputDto,
  UserChatOutputDtoMapper,
} from '../../api/dto/output-dto/get-all-user-chats.output.dto';
import { ChatQueryRepository } from '../../infrastructure/chat.query-repository';
import { SearchQueryParametersWithoutSorting } from '../../../../../../gateway/src/common/domain/query.types';

export class GetAllChatsForUserQuery implements IQuery {
  constructor(
    public userId: string,
    public query: SearchQueryParametersWithoutSorting,
    public endCursorChatId: string | null,
  ) {}
}

@QueryHandler(GetAllChatsForUserQuery)
export class GetAllChatsForUserUseCase
  implements
    IQueryHandler<
      GetAllChatsForUserQuery,
      AppNotificationResultType<Pagination<GetAllUserChatsOutputDto[]>>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly chatQueryRepository: ChatQueryRepository,
    private readonly paginatorService: PaginatorService,
    private readonly userChatOutputDtoMapper: UserChatOutputDtoMapper,
  ) {
    this.logger.setContext(GetAllChatsForUserUseCase.name);
  }

  async execute(
    query: GetAllChatsForUserQuery,
  ): Promise<
    AppNotificationResultType<Pagination<GetAllUserChatsOutputDto[]>>
  > {
    this.logger.debug(
      'Execute: get all chats for user query',
      this.execute.name,
    );
    const { userId, endCursorChatId, query: queryParams } = query;
    const { pageSize, pageNumber } = queryParams;
    try {
      const { total, items } = await this.chatQueryRepository.getChatsByUserId(
        userId,
        pageSize,
        endCursorChatId,
      );

      const result = this.paginatorService.create(
        pageNumber,
        pageSize,
        total,
        this.userChatOutputDtoMapper.mapChats(items),
      );

      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
