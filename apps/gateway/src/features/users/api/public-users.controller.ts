import {
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import {
  ProfilePublicInfoWithAboutOutputDtoModel,
  UserCountOutputDto,
} from './dto/output-dto/profile-info-output-dto';
import { PublicProfileInfoSwagger } from './swagger/public-profile-info.swagger';
import { PublicGetUsersCountSwagger } from './swagger/public-get-users-count.swagger';
import { USER_PUBLIC_ROUTE } from '../../../common/constants/route.constants';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { GetPublicProfileInfoQuery } from '../application/queryBus/get-public-profile-info.use-case';
import { LoggerService } from '@app/logger';
import { GetTotalRegisteredUserQuery } from '../application/queryBus/get-total-registered-users-count.use-case';

@ApiTags('Public-Users')
@Controller(USER_PUBLIC_ROUTE.MAIN)
export class PublicUsersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PublicUsersController.name);
  }

  @Get(`${USER_PUBLIC_ROUTE.PROFILE}/:userId`)
  @PublicProfileInfoSwagger()
  async gerProfileInfo(
    @Param('userId') userId: string,
  ): Promise<ProfilePublicInfoWithAboutOutputDtoModel> {
    this.logger.debug(
      `Execute: Get profile info, user id: ${userId}`,
      this.gerProfileInfo.name,
    );

    const result: AppNotificationResultType<ProfilePublicInfoWithAboutOutputDtoModel> =
      await this.queryBus.execute(new GetPublicProfileInfoQuery(userId));

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.gerProfileInfo.name);
        return result.data;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug(`Not found`, this.gerProfileInfo.name);
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Get()
  @PublicGetUsersCountSwagger()
  async getTotalRegisteredUsersCount(): Promise<UserCountOutputDto> {
    this.logger.debug(
      `Execute: Get total users count`,
      this.getTotalRegisteredUsersCount.name,
    );
    const result: AppNotificationResultType<UserCountOutputDto> =
      await this.queryBus.execute(new GetTotalRegisteredUserQuery());

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        return result.data;
      default:
        throw new InternalServerErrorException();
    }
  }
}
