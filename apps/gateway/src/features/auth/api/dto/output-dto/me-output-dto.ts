import { User } from '@prisma/gateway';

export class MeOutputDto {
  userId: string;
  userName: string;
  email: string;
}

export const userMapper = (user: User): MeOutputDto => {
  const outputUser = new MeOutputDto();
  outputUser.email = user.email;
  outputUser.userName = user.username;
  outputUser.userId = user.id;
  return outputUser;
};
