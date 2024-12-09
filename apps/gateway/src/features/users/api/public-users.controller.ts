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
  ProfilePublicInfoOutputDtoModel,
  UserCountOutputDto,
} from './dto/output-dto/profile-info-output-dto';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { PublicProfileInfoSwagger } from './swagger/public-profile-info.swagger';
import { PublicGetUsersCountSwagger } from './swagger/public-get-users-count.swagger';
import { USER_PUBLIC_ROUTE } from '../../../common/constants/route.constants';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { GetPublicProfileInfoQuery } from '../application/use-cases/queryBus/get-public-profile-info.use-case';

@ApiTags('Public-Users')
@Controller(USER_PUBLIC_ROUTE.MAIN)
export class PublicUsersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get(`${USER_PUBLIC_ROUTE.PROFILE}/:userId`)
  @PublicProfileInfoSwagger()
  async gerProfileInfo(
    @Param('userId') userId: string,
  ): Promise<ProfilePublicInfoOutputDtoModel> {
    const result: AppNotificationResultType<ProfilePublicInfoOutputDtoModel> =
      await this.queryBus.execute(new GetPublicProfileInfoQuery(userId));

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        return result.data;
      case AppNotificationResultEnum.NotFound:
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Get()
  @PublicGetUsersCountSwagger()
  async getTotalRegistredUsersCount(): Promise<UserCountOutputDto> {
    return { totalCount: await this.usersQueryRepository.getTotalCountUsers() };
  }
}
