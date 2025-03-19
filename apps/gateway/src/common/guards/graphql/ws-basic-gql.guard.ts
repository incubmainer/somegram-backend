import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface IWsBasicGqlParams {
  Authorization: string;
}

@Injectable()
export class WsBasicGqlGuard {
  constructor(private readonly configService: ConfigService) {}

  async auth(connectionParams: IWsBasicGqlParams): Promise<boolean> {
    const authHeader = connectionParams?.Authorization;
    if (!authHeader)
      throw new UnauthorizedException('Authorization header is missing');

    const [authType, credentials] = authHeader.split(' ');
    if (authType !== 'Basic' || !credentials)
      throw new UnauthorizedException('Invalid Authorization header format');

    const decodedCredentials = Buffer.from(credentials, 'base64').toString(
      'utf8',
    );
    const [username, password] = decodedCredentials.split(':');

    const validUsername = this.configService.get<string>('BASIC_AUTH_EMAIL');
    const validPassword = this.configService.get<string>('BASIC_AUTH_PASSWORD');

    if (username !== validUsername || password !== validPassword)
      throw new ForbiddenException('User not unauthorized');

    return true;
  }
}
