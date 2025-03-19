import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

import { UsersGraphqlRepository } from '../../../infrastructure/users.graphql-repository';
import { UserModel } from '../../../../resolvers/users/models/user.model';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../../../settings/configuration/configuration';

export class GetUserQuery {
  constructor(public id: string) {}
}

@QueryHandler(GetUserQuery)
export class GetUserUseCase
  implements IQueryHandler<GetUserQuery, AppNotificationResultType<UserModel>>
{
  private readonly frontProfileUrl: string;
  constructor(
    private usersGraphqlRepository: UsersGraphqlRepository,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    this.logger.setContext(GetUserUseCase.name);
    const frontProvider = this.configService.get('envSettings', {
      infer: true,
    }).FRONTED_PROVIDER;
    this.frontProfileUrl = `${frontProvider}/public-user/profile`;
  }
  async execute(
    command: GetUserQuery,
  ): Promise<AppNotificationResultType<UserModel>> {
    const { id } = command;
    try {
      const user = await this.usersGraphqlRepository.findUserById(id);
      if (!user) {
        return this.appNotification.notFound();
      }
      return this.appNotification.success(
        UserModel.mapUser(user, this.frontProfileUrl),
      );
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
