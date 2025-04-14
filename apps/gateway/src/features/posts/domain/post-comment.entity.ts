import { PostComment } from '@prisma/gateway';

export class PostCommentEntity implements PostComment {
  id: string;
  text: string;
  commentatorId: string;
  postId: string;
  createdAt: Date;
  answerForCommentId: string;

  constructor(dto: PostComment) {
    this.id = dto.id;
    this.text = dto.text;
    this.commentatorId = dto.commentatorId;
    this.postId = dto.postId;
    this.createdAt = dto.createdAt;
    this.answerForCommentId = dto.answerForCommentId;
  }
}
