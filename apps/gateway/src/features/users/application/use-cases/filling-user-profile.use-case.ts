import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UsersQueryRepository } from '../../infrastructure/users.query-repository';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { FillProfileInputDto } from '../../api/dto/input-dto/fill-profile.input-dto';
import { User } from '@prisma/gateway';
import { parseDateDDMMYYYY } from '../../../../common/utils/parse-date-dd-mm-yyyy';

export class FillingUserProfileCommand {
  constructor(
    public userId: string,
    public fillProfileInputDto: FillProfileInputDto,
  ) {}
}

@CommandHandler(FillingUserProfileCommand)
export class FillingUserProfileUseCase
  implements
    ICommandHandler<
      FillingUserProfileCommand,
      AppNotificationResultType<string, string>
    >
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(FillingUserProfileUseCase.name);
  }

  public async execute(
    command: FillingUserProfileCommand,
  ): Promise<AppNotificationResultType<string, string>> {
    const { userName, firstName, lastName, dateOfBirth, about, city, country } =
      command.fillProfileInputDto;
    const { userId } = command;
    try {
      const user: User | null = await this.usersQueryRepository.findUserById(
        command.userId,
      );
      if (!user) {
        return this.appNotification.notFound();
      }

      const uniqueUsername: User | null =
        await this.usersQueryRepository.getUserByUsername(userName);

      if (uniqueUsername?.username) {
        if (user.id !== uniqueUsername.id) {
          return this.appNotification.badRequest('Username already exist.');
        }
      }
      // @ts-ignore TODO:
      await this.usersRepository.updateUserProfileInfo(userId, {
        ...user,
        username: userName,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? parseDateDDMMYYYY(dateOfBirth) : null,
        about: about ? about : null,
        updatedAt: new Date(),
        city: city ? city : null,
        country: country ? country : null,
      });
      return this.appNotification.success(userId);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
