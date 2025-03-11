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

  constructor(user: UserEntity | User) {
    this.userId = user.id;
    this.userName = user.username;
    this.email = user.email;
  }
}
