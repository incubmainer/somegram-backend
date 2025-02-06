import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { AuthService } from '../auth.service';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';
import { CreateTokensCommand } from './create-token.use-case';
import { CheckRefreshTokenCommand } from './check-refresh-token';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import {
  JWTRefreshTokenPayloadType,
  JWTTokensType,
} from '../../../../common/domain/types/types';
export class RenewTokensCommand {
  constructor(public refreshToken: string) {}
}
@CommandHandler(RenewTokensCommand)
export class RenewTokensUseCase implements ICommandHandler<RenewTokensCommand> {
  constructor(
    private authService: AuthService,
    private securityDevicesRepository: SecurityDevicesRepository,
    private readonly commandBus: CommandBus,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(RenewTokensUseCase.name);
  }
  async execute(
    command: RenewTokensCommand,
  ): Promise<AppNotificationResultType<JWTTokensType>> {
    this.logger.debug('Execute: renew tokens', this.execute.name);

    try {
      const refreshTokenPayload: JWTRefreshTokenPayloadType | null =
        await this.commandBus.execute(
          new CheckRefreshTokenCommand(command.refreshToken),
        );
      if (!refreshTokenPayload) return this.appNotification.unauthorized();

      const tokens: JWTTokensType = await this.commandBus.execute(
        new CreateTokensCommand(
          refreshTokenPayload.userId,
          refreshTokenPayload.deviceId,
        ),
      );
      const lastActiveDate = new Date(
        refreshTokenPayload.iat * 1000,
      ).toISOString();
      await this.securityDevicesRepository.updateLastActiveDate(
        refreshTokenPayload.deviceId,
        lastActiveDate,
      );
      return this.appNotification.success(tokens);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
