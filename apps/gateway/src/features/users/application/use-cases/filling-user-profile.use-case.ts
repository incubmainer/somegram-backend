import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { FillProfileInputDto } from '../../api/dto/input-dto/fill-profile.input-dto';
import { DateFormatter } from '@app/date-formater';

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
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly dateFormatter: DateFormatter,
  ) {
    this.logger.setContext(FillingUserProfileUseCase.name);
  }

  public async execute(
    command: FillingUserProfileCommand,
  ): Promise<AppNotificationResultType<string, string>> {
    this.logger.debug(
      'Execute: filling user profile info command',
      this.execute.name,
    );
    const { userName, dateOfBirth } = command.fillProfileInputDto;
    const { userId } = command;
    try {
      const user = await this.usersRepository.getUserById(userId);
      if (!user) return this.appNotification.notFound();

      const uniqueUsername =
        await this.usersRepository.getUserByUsername(userName);

      if (uniqueUsername?.username) {
        if (user.id !== uniqueUsername.id)
          return this.appNotification.badRequest('Username already exist.');
      }

      let birthday: Date | null = null;
      if (dateOfBirth) birthday = this.dateFormatter.fromDDMMYYY(dateOfBirth);

      user.fillProfileInfo(command.fillProfileInputDto, birthday);
      await this.usersRepository.updateUserProfileInfo(user);
      return this.appNotification.success(userId);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
