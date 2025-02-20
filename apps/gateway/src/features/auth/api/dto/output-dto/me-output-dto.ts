import { User } from '@prisma/gateway';
import { UserEntity } from '../../../../users/domain/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class MeOutputDto {
  @ApiProperty()
  userId: string;
  @ApiProperty()
  userName: string;
  @ApiProperty()
  email: string;

  constructor(user: UserEntity) {
    this.userId = user.id;
    this.userName = user.username;
    this.email = user.email;
  }
}

export const userMapper = (user: User): MeOutputDto => {
  // @ts-ignore TODO: Удалить?
  const outputUser = new MeOutputDto();
  outputUser.email = user.email;
  outputUser.userName = user.username;
  outputUser.userId = user.id;
  return outputUser;
};
