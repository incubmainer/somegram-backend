import { LikeStatusEnum } from './types';
import { LikesComment, LikesPost } from '@prisma/gateway';

export class LikeEntity<T extends LikesComment | LikesPost> {
  id: string;
  userId: string;
  status: LikeStatusEnum;
  createdAt: Date;
  updatedAt: Date;

  constructor(dto: T) {
    this.id = dto.id;
    this.userId = dto.userId;
    this.status = dto.status as LikeStatusEnum;
    this.createdAt = dto.createdAt;
    this.updatedAt = dto.updatedAt;
  }

  updateLike(status: LikeStatusEnum): void {
    this.updatedAt = new Date();
    this.status = status;
  }
}

export class LikeCommentEntity
  extends LikeEntity<LikesComment>
  implements LikesComment
{
  commentId: string;

  constructor(dto: LikesComment) {
    super(dto);
    this.commentId = dto.commentId;
  }
}

export class LikePostEntity extends LikeEntity<LikesPost> implements LikesPost {
  postId: string;

  constructor(dto: LikesPost) {
    super(dto);
    this.postId = dto.postId;
  }
}
