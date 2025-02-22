export class TokensPairType {
  accessToken: string;
  refreshToken: string;
}

export class UserResetPasswordCreatedDto {
  userId: string;
  code: string;
  expiredAt: Date;
  createdAt: Date;
}

export class JWTRefreshTokenPayloadType {
  userId: string;
  deviceId: string;
  iat: number;
  exp: number;
}

export class JWTAccessTokenPayloadType {
  userId: string;
  iat: number;
  exp: number;
}
