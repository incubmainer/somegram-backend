import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { LoggerService } from '@app/logger';
import { JWTTokensType } from '../../../../common/domain/types/types';

export class CreateTokensCommand {
  constructor(
    public userId: string,
    public deviceId?: string,
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

  async execute(command: CreateTokensCommand): Promise<JWTTokensType> {
    this.logger.debug('Execute: create tokens', this.execute.name);
    const accessTokenPayload = { userId: command.userId };
    const refreshTokenPayload = {
      userId: command.userId,
      deviceId: command.deviceId ? command.deviceId : randomUUID(),
    };

    try {
      const accessToken = await this.jwtService.signAsync(accessTokenPayload, {
        // @ts-ignore TODO:
        secret: jwtConstants.JWT_SECRET,
        // @ts-ignore TODO:
        expiresIn: tokensLivesConstants['1hour'],
      });
      const refreshToken = await this.jwtService.signAsync(
        refreshTokenPayload,
        {
          // @ts-ignore TODO:
          secret: jwtConstants.REFRESH_TOKEN_SECRET,
          // @ts-ignore TODO:
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
