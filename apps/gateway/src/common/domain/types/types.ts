export type JWTRefreshTokenPayloadType = {
  userId: string;
  deviceId: string;
  iat: number;
  exp: number;
};

export type JWTAccessTokenPayloadType = {
  userId: string;
  iat: number;
  exp: number;
};

export type JWTTokensType = {
  accessToken: string;
  refreshToken: string;
};
