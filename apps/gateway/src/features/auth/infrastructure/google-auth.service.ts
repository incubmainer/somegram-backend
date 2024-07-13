import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface UserGoogleInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

@Injectable()
export class GoogleAuthService {
  private googleOAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  private googleTokenUrl = 'https://oauth2.googleapis.com/token';
  private googleUserInfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';

  constructor(private readonly configService: ConfigService) {}

  getGoogleAuthUrl(): string {
    const clientId = this.configService.get<string>('google.clientId');
    const redirectUri = this.configService.get<string>('google.redirectUri');
    const scope =
      'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope,
    });

    return `${this.googleOAuthUrl}?${params.toString()}`;
  }

  async getTokens(code: string): Promise<any> {
    const clientId = this.configService.get<string>('google.clientId');
    const clientSecret = this.configService.get<string>('google.clientSecret');
    const redirectUri = this.configService.get<string>('google.redirectUri');

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code,
    });

    const response = await fetch(this.googleTokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new BadRequestException('Failed to get tokens from Google');
    }

    const data = await response.json();
    return data;
  }

  async getUserInfo(accessToken: string): Promise<UserGoogleInfo> {
    const response = await fetch(this.googleUserInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new BadRequestException('Failed to get user info from Google');
    }

    const data: UserGoogleInfo = await response.json();
    return data;
  }
}
