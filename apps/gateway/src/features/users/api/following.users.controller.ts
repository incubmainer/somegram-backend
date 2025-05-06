import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
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
import { Pagination } from '@app/paginator';

import { FOLLOWING_USER_ROUTE } from '../../../common/constants/route.constants';
import { CurrentUserId } from '../../../common/decorators/http-parse/current-user-id-param.decorator';
import { SearchQueryParametersWithoutSorting } from '../../../common/domain/query.types';
import { SearchProfilesQuery } from '../application/queryBus/search-profiles.use-case';
import {
  FollowingProfileOutputDtoModel,
  ProfileInfoWithFullCountsInfosOutputDtoModel,
  ProfilePublicInfoWithAboutOutputDtoModel,
} from './dto/output-dto/profile-info-output-dto';
import { SearchUsersSwagger as SearchUsersSwagger } from './swagger/search-users.swagger';
import { FollowToUserCommand } from '../application/use-cases/follow-to-user.use-case';
import { FollowToUserSwagger } from './swagger/follow-to-user.swagger';
import { UnfollowToUserCommand } from '../application/use-cases/unfollow-to-user.use-case';
import { UnfollowToUserSwagger } from './swagger/unfollow-to-user.swagger';
import { DeleteFollowerCommand } from '../application/use-cases/delete-follower.use-case';
import { DeleteFollowerSwagger } from './swagger/delete-follower.swagger';
import { GetUserProfileWithCountsInfosQuery } from '../application/queryBus/get-profile-with-counts-infos.use-case';
import { ProfileInfoWithCountsInfoSwagger } from './swagger/profile-info-with-counts-info.swagger';
import { GetFollowersQuery } from '../application/queryBus/get-followers.use-case';
import { GetFollowingQuery } from '../application/queryBus/get-following.use-case';
import { GetFollowersSwagger } from './swagger/get-followers.swagger';
import { GetFollowingSwagger } from './swagger/get-following.swagger';

@ApiTags('Users-following and followers')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller(FOLLOWING_USER_ROUTE.MAIN)
export class FollowingUsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(FollowingUsersController.name);
  }

  @Get(':endCursorUserId?')
  @SearchUsersSwagger()
  async searchUsers(
    @CurrentUserId() userId: string,
    @Query() query?: SearchQueryParametersWithoutSorting,
    @Param('endCursorUserId') endCursorUserId?: string,
  ): Promise<Pagination<ProfilePublicInfoWithAboutOutputDtoModel[]>> {
    this.logger.debug(`Execute: Search users:`, this.searchUsers.name);

    const result: AppNotificationResultType<
      Pagination<ProfilePublicInfoWithAboutOutputDtoModel[]>
    > = await this.queryBus.execute(
      new SearchProfilesQuery(userId, query, endCursorUserId),
    );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.searchUsers.name);
        return result.data;
      default:
        throw new InternalServerErrorException();
    }
  }

  @Post(`${FOLLOWING_USER_ROUTE.FOLLOW}/:followeeId`)
  @FollowToUserSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  async followToUser(
    @CurrentUserId() userId: string,
    @Param('followeeId') followeeId: string,
  ): Promise<null> {
    this.logger.debug(`Execute: Follow to user:`, this.followToUser.name);

    const result: AppNotificationResultType<null> =
      await this.commandBus.execute(
        new FollowToUserCommand(userId, followeeId),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.followToUser.name);
        return;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug(`Not found`, this.followToUser.name);
        throw new NotFoundException();
      case AppNotificationResultEnum.BadRequest:
        this.logger.debug(`Bad request`, this.followToUser.name);
        throw new BadRequestException(result.errorField);
      default:
        throw new InternalServerErrorException();
    }
  }

  @Post(`${FOLLOWING_USER_ROUTE.UNFOLLOW}/:followeeId`)
  @UnfollowToUserSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  async unfollowToUser(
    @CurrentUserId() userId: string,
    @Param('followeeId') followeeId: string,
  ): Promise<null> {
    this.logger.debug(`Execute: Unfollow to user`, this.unfollowToUser.name);

    const result: AppNotificationResultType<null> =
      await this.commandBus.execute(
        new UnfollowToUserCommand(userId, followeeId),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.unfollowToUser.name);
        return;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug(`Not found`, this.unfollowToUser.name);
        throw new NotFoundException();
      case AppNotificationResultEnum.BadRequest:
        this.logger.debug(`Bad request`, this.unfollowToUser.name);
        throw new BadRequestException(result.errorField);
      default:
        throw new InternalServerErrorException();
    }
  }

  @Delete(`${FOLLOWING_USER_ROUTE.UNFOLLOW}/:followerId`)
  @DeleteFollowerSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFollower(
    @CurrentUserId() userId: string,
    @Param('followerId') followerId: string,
  ): Promise<null> {
    this.logger.debug(
      `Execute: Remove follower ${followerId}`,
      this.unfollowToUser.name,
    );

    const result: AppNotificationResultType<null> =
      await this.commandBus.execute(
        new DeleteFollowerCommand(userId, followerId),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.deleteFollower.name);
        return;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug(`Not found`, this.deleteFollower.name);
        throw new NotFoundException();
      case AppNotificationResultEnum.BadRequest:
        this.logger.debug(`Bad request`, this.deleteFollower.name);
        throw new BadRequestException(result.errorField);
      default:
        throw new InternalServerErrorException();
    }
  }

  @Get(`:userId/${FOLLOWING_USER_ROUTE.PROFILE}`)
  @ProfileInfoWithCountsInfoSwagger()
  async getProfile(
    @CurrentUserId() currentUserId: string,
    @Param('userId') userId: string,
  ): Promise<ProfileInfoWithFullCountsInfosOutputDtoModel> {
    this.logger.debug(
      `Execute: Get profile for user ${userId}`,
      this.getProfile.name,
    );

    const result: AppNotificationResultType<ProfileInfoWithFullCountsInfosOutputDtoModel> =
      await this.queryBus.execute(
        new GetUserProfileWithCountsInfosQuery(currentUserId, userId),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.getProfile.name);
        return result.data;

      case AppNotificationResultEnum.NotFound:
        this.logger.debug(`Not found`, this.getProfile.name);
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Get(`${FOLLOWING_USER_ROUTE.FOLLOWERS}/:userId/:endCursorUserId?`)
  @GetFollowersSwagger()
  async getFollowers(
    @Param('userId') userId: string,
    @CurrentUserId() currentUserId: string,
    @Query() query?: SearchQueryParametersWithoutSorting,
    @Param('endCursorUserId') endCursorUserId?: string,
  ): Promise<Pagination<FollowingProfileOutputDtoModel[]>> {
    this.logger.debug(
      `Execute: Get followers for user ${userId}`,
      this.getFollowers.name,
    );

    const result: AppNotificationResultType<
      Pagination<FollowingProfileOutputDtoModel[]>
    > = await this.queryBus.execute(
      new GetFollowersQuery(userId, currentUserId, query, endCursorUserId),
    );

    if (result.appResult === AppNotificationResultEnum.Success) {
      return result.data;
    }
    throw new InternalServerErrorException();
  }

  @Get(`${FOLLOWING_USER_ROUTE.FOLLOWING}/:userId/:endCursorUserId?`)
  @GetFollowingSwagger()
  async getFollowing(
    @Param('userId') userId: string,
    @CurrentUserId() currentUserId: string,
    @Query() query?: SearchQueryParametersWithoutSorting,
    @Param('endCursorUserId') endCursorUserId?: string,
  ): Promise<Pagination<FollowingProfileOutputDtoModel[]>> {
    this.logger.debug(
      `Execute: Get following for user ${userId}`,
      this.getFollowing.name,
    );

    const result: AppNotificationResultType<
      Pagination<FollowingProfileOutputDtoModel[]>
    > = await this.queryBus.execute(
      new GetFollowingQuery(userId, currentUserId, query, endCursorUserId),
    );

    if (result.appResult === AppNotificationResultEnum.Success) {
      return result.data;
    }
    throw new InternalServerErrorException();
  }
}
