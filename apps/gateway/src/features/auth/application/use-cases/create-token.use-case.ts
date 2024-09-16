import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

import {
  jwtConstants,
  tokensLivesConstants,
} from 'apps/gateway/src/common/config/constants/jwt-basic-constants';

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
  constructor(private readonly jwtService: JwtService) {}

  async execute(command: CreateTokensCommand) {
    const accessTokenPayload = { sub: command.userId };

    const refreshTokenPayload = {
      sub: command.userId,
      deviceId: command.deviceId,
    };

    const accessToken = await this.jwtService.signAsync(accessTokenPayload, {
      secret: jwtConstants.JWT_SECRET,
      expiresIn: tokensLivesConstants['1hour'],
    });
    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {
      secret: jwtConstants.REFRESH_TOKEN_SECRET,
      expiresIn: tokensLivesConstants['2hours'],
    });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
