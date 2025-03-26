import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoggerService } from '@app/logger';
import { AuthGuard } from '@nestjs/passport';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';

import { USER_ROUTE } from '../../../common/constants/route.constants';
import { CurrentUserId } from '../../../common/decorators/http-parse/current-user-id-param.decorator';
import { SearchQueryParametersWithoutSorting } from '../../../common/domain/query.types';
import { SearchProfilesQuery } from '../application/queryBus/get-profiles-by-search.use-case';
import { ProfilePublicInfoOutputDtoModel } from './dto/output-dto/profile-info-output-dto';
import { SearchUsersSwagger as SearchUsersSwagger } from './swagger/search-users.swagger';

@ApiTags('Users-following and followers')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller(USER_ROUTE.MAIN)
export class FollowingUsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(FollowingUsersController.name);
  }

  @Get(':cursorUserId?')
  @SearchUsersSwagger()
  async searchUsers(
    @CurrentUserId() userId: string,
    @Query() query?: SearchQueryParametersWithoutSorting,
    @Param('cursorUserId') cursorUserId?: string,
  ): Promise<ProfilePublicInfoOutputDtoModel[]> {
    this.logger.debug(`Execute: Search users:`, this.searchUsers.name);

    const result: AppNotificationResultType<ProfilePublicInfoOutputDtoModel[]> =
      await this.queryBus.execute(
        new SearchProfilesQuery(userId, query, cursorUserId),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.searchUsers.name);
        return result.data;
      default:
        throw new InternalServerErrorException();
    }
  }
}
