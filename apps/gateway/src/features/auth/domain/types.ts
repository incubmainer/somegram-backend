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
