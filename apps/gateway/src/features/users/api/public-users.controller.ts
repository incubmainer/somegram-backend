import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { NotificationObject } from 'apps/gateway/src/common/domain/notification';
import { userPublicProfileInfoMapper } from './dto/output-dto/profile-info-output-dto';
import {
  GetProfileInfoQuery,
  ProfileInfoCodes,
} from '../application/use-cases/queryBus/get-profile-info.use-case';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { User } from '@prisma/gateway';
import { PublicProfileInfoSwagger } from './swagger/public-profile-info.swagger';
import { PublicGetUsersCountSwagger } from './swagger/public-get-users-count.swagger';

@ApiTags('Public-Users')
@Controller('public-users')
export class PublicUsersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get('/profile/:userId')
  @PublicProfileInfoSwagger()
  async gerProfileInfo(@Param('userId') userId: string) {
    const notification: NotificationObject<{
      user: User;
      avatarUrl: string | null;
    }> = await this.queryBus.execute(new GetProfileInfoQuery(userId));
    const code = notification.getCode();
    if (code === ProfileInfoCodes.UserNotFound)
      throw new UnauthorizedException();
    if (code === ProfileInfoCodes.TransactionError) {
      throw new InternalServerErrorException();
    }
    const { user, avatarUrl } = notification.getData();
    const outputUser = userPublicProfileInfoMapper(user, avatarUrl);
    return outputUser;
  }

  @Get()
  @PublicGetUsersCountSwagger()
  async getTotalRegistredUsersCount() {
    return { totalCount: await this.usersQueryRepository.getTotalCountUsers() };
  }
}
