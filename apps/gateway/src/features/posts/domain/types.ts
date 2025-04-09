import { UserPost } from '@prisma/gateway';
import { UserEntity } from '../../users/domain/user.entity';

export class CreatedPostDto {
  createdAt: Date;
  userId: string;
  description: string;
}

export class UserPostWithOwnerInfo implements UserPost {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  description: string;
  User: UserEntity;
}
