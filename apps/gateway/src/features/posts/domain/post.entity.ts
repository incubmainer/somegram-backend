import { UserPost } from '@prisma/gateway';

export class PostEntity implements UserPost {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  description: string;

  constructor(dto: UserPost) {
    this.id = dto.id;
    this.userId = dto.userId;
    this.createdAt = dto.createdAt;
    this.updatedAt = dto.updatedAt;
    this.description = dto.description;
  }

  updatePost(description: string): void {
    this.description = description;
    this.updatedAt = new Date();
  }
}
