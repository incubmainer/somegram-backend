export const jwtConstants = {
  JWT_SECRET: process.env.JWT_SECRET || '123',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_SECRET || '234',
};

export const tokensLivesConstants = {
  '1hour': '1h',
  '2hours': '2h',
};
