import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

import {
  jwtConstants,
  tokensLivesConstants,
} from '../../../../common/constants/jwt-basic-constants';
import { LoggerService } from '@app/logger';
export class CreateTokensCommand {
  constructor(
    public userId: string,
    public deviceId = randomUUID(),
  ) {}
}

@CommandHandler(CreateTokensCommand)
export class CreateTokensUseCase
  implements ICommandHandler<CreateTokensCommand>
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(CreateTokensUseCase.name);
  }

  async execute(command: CreateTokensCommand) {
    this.logger.debug('Execute: create tokens', this.execute.name);
    const accessTokenPayload = { userId: command.userId };
    try {
      const refreshTokenPayload = {
        userId: command.userId,
        deviceId: command.deviceId,
      };

      const accessToken = await this.jwtService.signAsync(accessTokenPayload, {
        secret: jwtConstants.JWT_SECRET,
        expiresIn: tokensLivesConstants['1hour'],
      });
      const refreshToken = await this.jwtService.signAsync(
        refreshTokenPayload,
        {
          secret: jwtConstants.REFRESH_TOKEN_SECRET,
          expiresIn: tokensLivesConstants['2hours'],
        },
      );

      return {
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    } catch (e) {
      this.logger.error(e, this.execute.name);
    }
  }
}
