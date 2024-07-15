import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleConfig } from 'apps/gateway/src/common/config/configs/google.config';

export interface UserGoogleInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

export interface GoogleTokens {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
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
    const scope = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scope.join(' '),
    });

    return `${this.googleOAuthUrl}?${params.toString()}`;
  }

  async getTokens(code: string): Promise<GoogleTokens | null> {
    const googleConfig = this.configService.get<GoogleConfig>('google');
    const clientId = googleConfig.clientId;
    const clientSecret = googleConfig.clientSecret;
    const redirectUri = googleConfig.redirectUri;

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
      return null;
    }

    const data = await response.json();
    return data;
  }

  async getUserInfo(accessToken: string): Promise<UserGoogleInfo | null> {
    const response = await fetch(this.googleUserInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data: UserGoogleInfo = await response.json();
    return data;
  }

  async getUserInfoByCode(code: string): Promise<UserGoogleInfo | null> {
    const tokens = await this.getTokens(code);
    if (!tokens) return null;
    const userInfo = await this.getUserInfo(tokens.access_token);
    if (!userInfo) return null;
    return userInfo;
  }
}
